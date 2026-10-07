import "server-only";
import { cache } from "react";
import type { Prisma } from "@/generated/prisma/client";
import type { JournalPrompt, PromptQuestion, PromptStatus, QuestionType } from "@/data/journal-prompts";
import type { PromptResponse, ResponseAnswer } from "@/data/prompt-responses";
import { avatarSrc } from "@/server/avatar";
import { toAttachmentDtos } from "@/server/member/attachments";
import { db } from "@/lib/db";
import { promptCode, userCode } from "@/lib/codes";
import { ApiError, notFound } from "@/lib/server/errors";
import { deleteObjects } from "@/lib/server/r2";
import { isoDate, timeWib, todayWib } from "@/lib/server/time";
import type { PromptInput } from "./schemas";

const withQuestions = { questions: { orderBy: { position: "asc" } } } satisfies Prisma.JournalPromptInclude;
type PromptRow = Prisma.JournalPromptGetPayload<{ include: typeof withQuestions }>;

const TYPE_OUT = { TEXT: "text", SCALE: "scale", CHOICE: "choice", MOOD: "mood" } as const;
const TYPE_IN = { text: "TEXT", scale: "SCALE", choice: "CHOICE", mood: "MOOD" } as const;
const STATUS_OUT = { DRAF: "draf", TERJADWAL: "terjadwal", TERBIT: "terbit" } as const;

/** Prompt terjadwal otomatis berstatus terbit begitu tanggal tayangnya tiba (WIB). */
function effectiveStatus(row: Pick<PromptRow, "status" | "date">): PromptStatus {
  if (row.status === "TERJADWAL" && isoDate(row.date) <= todayWib()) return "terbit";
  return STATUS_OUT[row.status];
}

function toPrompt(row: PromptRow): JournalPrompt {
  return {
    id: promptCode.format(row.id),
    title: row.title,
    subtitle: row.subtitle,
    date: isoDate(row.date),
    status: effectiveStatus(row),
    questions: row.questions.map(
      (q): PromptQuestion => ({
        id: String(q.id),
        type: TYPE_OUT[q.type],
        label: q.label,
        ...(q.type === "TEXT" ? { required: q.required } : {}),
        ...(q.type === "CHOICE" || (q.type === "MOOD" && q.options.length) ? { options: q.options } : {}),
      }),
    ),
  };
}

export const listPrompts = cache(async (): Promise<JournalPrompt[]> => {
  const rows = await db.journalPrompt.findMany({ include: withQuestions, orderBy: { date: "desc" } });
  return rows.map(toPrompt);
});

async function findRow(code: string): Promise<PromptRow> {
  const id = promptCode.parse(code);
  const row = id ? await db.journalPrompt.findUnique({ where: { id }, include: withQuestions }) : null;
  if (!row) throw notFound("Prompt");
  return row;
}

export const getPrompt = cache(async (code: string): Promise<JournalPrompt | null> => {
  const id = promptCode.parse(code);
  const row = id ? await db.journalPrompt.findUnique({ where: { id }, include: withQuestions }) : null;
  return row ? toPrompt(row) : null;
});

/**
 * Prompt yang tayang pada tanggal itu untuk peserta: bukan draf dan tanggalnya sudah tiba (WIB).
 * Dipakai sisi member; null berarti hari itu tidak ada prompt (peserta boleh menulis jurnal bebas).
 */
export async function getPromptForDate(date: string): Promise<JournalPrompt | null> {
  if (date > todayWib()) return null;
  const row = await db.journalPrompt.findFirst({
    where: { date: new Date(`${date}T00:00:00Z`), status: { not: "DRAF" } },
    include: withQuestions,
  });
  return row ? toPrompt(row) : null;
}

/** Jumlah jawaban peserta per prompt (kode prompt -> jumlah); prompt tanpa jawaban tidak ada di peta. */
export async function getResponseCounts(): Promise<Record<string, number>> {
  const rows = await db.promptResponse.groupBy({ by: ["promptId"], _count: { _all: true }, where: { promptId: { not: null } } });
  return Object.fromEntries(rows.flatMap((r) => (r.promptId === null ? [] : [[promptCode.format(r.promptId), r._count._all]])));
}

/**
 * Menghapus prompt beserta pertanyaan dan SEMUA jawaban peserta (entri jurnal berprompt itu,
 * jawaban per pertanyaan, dan lampirannya; berkas lampiran di R2 ikut dihapus). Tidak bisa dibatalkan.
 */
export async function deletePrompt(code: string): Promise<{ deletedResponses: number }> {
  const existing = await findRow(code);
  const attachments = await db.promptAttachment.findMany({
    where: { response: { promptId: existing.id }, key: { not: null } },
    select: { key: true },
  });
  const deletedResponses = await db.promptResponse.count({ where: { promptId: existing.id } });
  await db.journalPrompt.delete({ where: { id: existing.id } }); // cascade: pertanyaan, jawaban, entri, lampiran
  await deleteObjects(attachments.flatMap((a) => (a.key ? [a.key] : [])));
  return { deletedResponses };
}

const questionData = (questions: PromptInput["questions"]) =>
  questions.map((q, position) => ({
    position,
    type: TYPE_IN[q.type],
    label: q.label,
    required: q.type === "text" ? q.required : true,
    options: q.type === "choice" || q.type === "mood" ? (q.options ?? []).map((o) => o.trim()).filter(Boolean) : [],
  }));

async function assertDateFree(date: string, exceptId?: number) {
  const clash = await db.journalPrompt.findFirst({
    where: { date: new Date(`${date}T00:00:00Z`), ...(exceptId ? { id: { not: exceptId } } : {}) },
    select: { id: true },
  });
  if (clash)
    throw new ApiError(409, `Sudah ada prompt pada tanggal itu (${promptCode.format(clash.id)}). Satu hari hanya boleh satu prompt.`, {
      date: "Tanggal sudah dipakai prompt lain.",
    });
}

export async function createPrompt(input: PromptInput): Promise<JournalPrompt> {
  await assertDateFree(input.date);
  const row = await db.journalPrompt
    .create({
      data: {
        title: input.title,
        subtitle: input.subtitle,
        date: new Date(`${input.date}T00:00:00Z`),
        status: "TERJADWAL",
        questions: { create: questionData(input.questions) },
      },
      include: withQuestions,
    })
    .catch(rethrowDateClash);
  return toPrompt(row);
}

export async function updatePrompt(code: string, input: PromptInput): Promise<JournalPrompt> {
  const existing = await findRow(code);
  if (effectiveStatus(existing) === "terbit")
    throw new ApiError(409, "Prompt yang sudah terbit tidak dapat diedit.");
  await assertDateFree(input.date, existing.id);

  const row = await db
    .$transaction(async (tx) => {
      // Prompt yang belum terbit belum punya jawaban, jadi pertanyaan boleh diganti seluruhnya.
      await tx.promptQuestion.deleteMany({ where: { promptId: existing.id } });
      return tx.journalPrompt.update({
        where: { id: existing.id },
        data: {
          title: input.title,
          subtitle: input.subtitle,
          date: new Date(`${input.date}T00:00:00Z`),
          status: "TERJADWAL",
          questions: { create: questionData(input.questions) },
        },
        include: withQuestions,
      });
    })
    .catch(rethrowDateClash);
  return toPrompt(row);
}

function rethrowDateClash(error: unknown): never {
  // Balapan antara cek tanggal dan insert: unique constraint pada `date`.
  if (typeof error === "object" && error && (error as { code?: string }).code === "P2002")
    throw new ApiError(409, "Sudah ada prompt pada tanggal itu.", { date: "Tanggal sudah dipakai prompt lain." });
  throw error;
}

// ---- Jawaban peserta ----

type ResponseRow = Prisma.PromptResponseGetPayload<{
  include: { answers: true; attachments: true };
}>;

async function toResponse(
  user: { id: number; name: string; avatarUrl: string | null },
  prompt: JournalPrompt,
  row: ResponseRow | undefined,
): Promise<PromptResponse> {
  const base = { userId: userCode.format(user.id), name: user.name, avatar: await avatarSrc(user.avatarUrl) };
  if (!row) return { ...base, answeredAt: null, answers: [], attachments: [] };

  // Entri yang tidak dibagikan ke coach: teks tidak boleh terbaca admin (jawaban skala/pilihan/mood
  // tetap tampil karena dianonimkan untuk kurikulum bersama).
  const PRIVATE_TEXT = "🔒 Privat — tidak dibagikan ke coach";
  const answers: ResponseAnswer[] = prompt.questions.flatMap((q) => {
    const a = row.answers.find((x) => String(x.questionId) === q.id);
    if (!a) return [];
    const hide = !row.shared && q.type === "text";
    return [{ questionId: q.id, label: q.label, type: q.type as QuestionType, value: hide ? PRIVATE_TEXT : a.value }];
  });
  if (row.content.trim()) {
    answers.push({ label: "Catatan Rasa", type: "text", value: row.shared ? row.content : PRIVATE_TEXT });
  }
  // Lampiran entri yang tidak dibagikan ke coach juga tidak boleh terlihat admin.
  const attachments = row.shared ? await toAttachmentDtos(row.attachments) : [];
  return { ...base, answeredAt: timeWib(row.answeredAt), answers, attachments };
}

const participantWhere = { role: "MEMBER", status: "ACTIVE" } as const;

/** Satu entri per peserta aktif (urut id); yang belum mengisi punya `answeredAt: null`. */
export async function getPromptResponses(prompt: JournalPrompt): Promise<PromptResponse[]> {
  const promptId = promptCode.parse(prompt.id)!;
  const [users, rows] = await Promise.all([
    db.user.findMany({
      where: participantWhere,
      orderBy: { id: "asc" },
      select: { id: true, name: true, avatarUrl: true },
    }),
    db.promptResponse.findMany({ where: { promptId }, include: { answers: true, attachments: true } }),
  ]);
  const byUser = new Map(rows.map((r) => [r.userId, r]));
  return Promise.all(users.map((u) => toResponse(u, prompt, byUser.get(u.id))));
}

export async function getPromptResponse(prompt: JournalPrompt, userId: string): Promise<PromptResponse | null> {
  const uid = userCode.parse(userId);
  const user = uid && (await db.user.findFirst({ where: { id: uid, ...participantWhere }, select: { id: true, name: true, avatarUrl: true } }));
  if (!user) return null;
  const row = await db.promptResponse.findUnique({
    where: { promptId_userId: { promptId: promptCode.parse(prompt.id)!, userId: user.id } },
    include: { answers: true, attachments: true },
  });
  return toResponse(user, prompt, row ?? undefined);
}
