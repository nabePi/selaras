import "server-only";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { formatDateId } from "@/data/admin-prompts";
import { SCALE_MAX, type JournalPrompt } from "@/data/journal-prompts";
import { JOURNAL_FEELINGS } from "@/data/member";
import type { ResponseAttachment } from "@/data/prompt-responses";
import { MAX_ATTACHMENTS } from "@/lib/attachments";
import { deleteObjects } from "@/lib/server/r2";
import { toAttachmentDtos, verifyNewAttachments, type NewAttachment } from "./attachments";
import { db } from "@/lib/db";
import type { AnswerMap, MemberEntry, WeekDayStatus } from "@/lib/journal-types";
import { ApiError } from "@/lib/server/errors";
import { addDays, todayWib, weekdayId } from "@/lib/server/time";
import { getPromptForDate } from "@/server/admin/prompts";

const withDetail = {
  prompt: { select: { title: true } },
  answers: { include: { question: true }, orderBy: { question: { position: "asc" } } },
  attachments: true,
} satisfies Prisma.PromptResponseInclude;
type EntryRow = Prisma.PromptResponseGetPayload<{ include: typeof withDetail }>;

const isoOf = (d: Date) => d.toISOString().slice(0, 10);

function moodOf(value: string) {
  return JOURNAL_FEELINGS.find((f) => value.endsWith(f.label)) ?? null;
}

function toEntry(row: EntryRow, attachments: ResponseAttachment[]): MemberEntry {
  const date = isoOf(row.date);
  const answers = row.answers.map((a) => ({ label: a.question.label, type: a.question.type.toLowerCase(), value: a.value }));
  const mood = answers.find((a) => a.type === "mood");
  const firstText = answers.find((a) => a.type === "text")?.value ?? "";
  const body = row.content.trim() || firstText;
  return {
    id: String(row.id),
    date,
    dateLabel: formatDateId(date),
    dayLabel: weekdayId(date),
    promptTitle: row.prompt?.title ?? null,
    excerpt: body.length > 160 ? `${body.slice(0, 157).trimEnd()}...` : body,
    content: body,
    feeling: mood ? moodOf(mood.value) : null,
    shared: row.shared,
    answers,
    attachments,
  };
}

export async function listEntries(userId: number): Promise<MemberEntry[]> {
  const rows = await db.promptResponse.findMany({ where: { userId }, include: withDetail, orderBy: { date: "desc" } });
  return Promise.all(rows.map(async (r) => toEntry(r, await toAttachmentDtos(r.attachments))));
}

export async function getEntry(userId: number, id: string): Promise<MemberEntry | null> {
  const n = Number(id);
  if (!Number.isSafeInteger(n) || n <= 0) return null;
  const row = await db.promptResponse.findFirst({ where: { id: n, userId }, include: withDetail });
  return row ? toEntry(row, await toAttachmentDtos(row.attachments)) : null;
}

/** Jawaban tersimpan hari ini dalam bentuk yang dipakai form (untuk menyunting entri hari ini). */
export type TodayEntry = { content: string; shared: boolean; answers: AnswerMap; attachments: ResponseAttachment[] };

export async function getTodayEntry(
  userId: number,
  prompt: JournalPrompt | null,
  date = todayWib(),
): Promise<TodayEntry | null> {
  const row = await db.promptResponse.findUnique({
    where: { userId_date: { userId, date: new Date(`${date}T00:00:00Z`) } },
    include: { answers: true, attachments: true },
  });
  if (!row) return null;
  const answers: AnswerMap = {};
  for (const q of prompt?.questions ?? []) {
    const a = row.answers.find((x) => String(x.questionId) === q.id);
    if (!a) continue;
    if (q.type === "scale") answers[q.id] = Number.parseInt(a.value, 10);
    else if (q.type === "mood") answers[q.id] = moodOf(a.value)?.label ?? "";
    else answers[q.id] = a.value;
  }
  return { content: row.content, shared: row.shared, answers, attachments: await toAttachmentDtos(row.attachments) };
}

/**
 * Tanggal prompt admin yang tertinggal (belum diisi) milik peserta: semua prompt sejak yang pertama
 * dibuat admin sampai kemarin, urut dari yang terlama. Draf dan hari tanpa prompt tidak dihitung.
 */
export async function getMissedDates(userId: number): Promise<string[]> {
  const before = { lt: new Date(`${todayWib()}T00:00:00Z`) };
  const [prompts, done] = await Promise.all([
    db.journalPrompt.findMany({ where: { date: before, status: { not: "DRAF" } }, select: { date: true }, orderBy: { date: "asc" } }),
    db.promptResponse.findMany({ where: { userId, date: before }, select: { date: true } }),
  ]);
  const filled = new Set(done.map((r) => isoOf(r.date)));
  return prompts.map((p) => isoOf(p.date)).filter((d) => !filled.has(d));
}

/** Tanggal "aktif" untuk peserta: prompt tertinggal terlama, atau hari ini bila tidak ada. */
export async function getActiveDate(userId: number): Promise<string> {
  return (await getMissedDates(userId))[0] ?? todayWib();
}

/**
 * Streak jurnal: jumlah hari berturut-turut yang ada entrinya. Bila hari ini belum diisi, streak
 * tetap dihitung dari kemarin (hari ini masih berjalan, belum dianggap putus).
 */
export async function getStreak(userId: number): Promise<number> {
  const today = todayWib();
  const rows = await db.promptResponse.findMany({
    where: { userId, date: { lte: new Date(`${today}T00:00:00Z`) } },
    select: { date: true },
    orderBy: { date: "desc" },
    take: 400,
  });
  const dates = new Set(rows.map((r) => isoOf(r.date)));
  let cursor = dates.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (dates.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

const mondayOf = (iso: string) => addDays(iso, -((new Date(`${iso}T00:00:00Z`).getUTCDay() + 6) % 7));
const weeksBetween = (from: string, to: string) =>
  Math.round((new Date(`${to}T00:00:00Z`).getTime() - new Date(`${from}T00:00:00Z`).getTime()) / (7 * 86_400_000));

/**
 * Status 7 hari (Senin–Minggu) pada pekan berjalan, atau `weeksBack` pekan sebelumnya. Mundur dibatasi
 * sampai pekan prompt admin pertama / jurnal pertama peserta.
 */
export async function getWeek(userId: number, weeksBack = 0) {
  const today = todayWib();
  const currentMonday = mondayOf(today);
  const [firstPrompt, firstEntry] = await Promise.all([
    db.journalPrompt.aggregate({ _min: { date: true }, where: { status: { not: "DRAF" } } }),
    db.promptResponse.aggregate({ _min: { date: true }, where: { userId } }),
  ]);
  const earliest = [firstPrompt._min.date, firstEntry._min.date].flatMap((d) => (d ? [isoOf(d)] : [])).sort()[0] ?? today;
  const maxBack = Math.max(0, weeksBetween(mondayOf(earliest), currentMonday));
  const offset = Math.min(Math.max(0, weeksBack), maxBack);

  const monday = addDays(currentMonday, -7 * offset);
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const rows = await db.promptResponse.findMany({
    where: { userId, date: { gte: new Date(`${days[0]}T00:00:00Z`), lte: new Date(`${days[6]}T00:00:00Z`) } },
    select: { date: true },
  });
  const done = new Set(rows.map((r) => isoOf(r.date)));
  const missed = new Set(await getMissedDates(userId));
  const labels = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
  const week = days.map((date, i) => {
    const status: WeekDayStatus = done.has(date) ? "done" : date > today ? "upcoming" : date === today ? "pending" : missed.has(date) ? "missed" : "empty";
    return { date, label: labels[i], status };
  });
  return { days: week, doneCount: done.size, offset, canGoBack: offset < maxBack };
}

const submitSchema = z.object({
  content: z.string().trim().min(1, "Catatan Rasa wajib diisi.").max(5000, "Catatan terlalu panjang."),
  shared: z.boolean(),
  answers: z.record(z.string(), z.union([z.string().max(2000), z.number()])).default({}),
  /** `keep`: id lampiran lama yang dipertahankan; `added`: berkas baru yang sudah diunggah ke R2. */
  attachments: z
    .object({
      keep: z.array(z.number().int()).default([]),
      added: z.array(z.object({ key: z.string().min(1).max(500), name: z.string().trim().min(1).max(200) })).default([]),
    })
    .default({ keep: [], added: [] }),
});

/** Nilai yang disimpan per pertanyaan; format sama dengan yang dibaca insight admin. */
function serializeAnswers(prompt: JournalPrompt, answers: AnswerMap): { questionId: number; value: string }[] {
  const out: { questionId: number; value: string }[] = [];
  const fields: Record<string, string> = {};
  for (const q of prompt.questions) {
    const raw = answers[q.id];
    let value: string | null = null;
    if (q.type === "text") value = typeof raw === "string" && raw.trim() ? raw.trim() : null;
    else if (q.type === "scale")
      value = typeof raw === "number" && Number.isInteger(raw) && raw >= 1 && raw <= SCALE_MAX ? `${raw} / ${SCALE_MAX}` : null;
    else if (q.type === "choice") value = typeof raw === "string" && (q.options ?? []).includes(raw) ? raw : null;
    else {
      const m = JOURNAL_FEELINGS.find((f) => f.label === raw);
      value = m ? `${m.emoji} ${m.label}` : null;
    }
    if (value === null) fields[`answers.${q.id}`] = "Pertanyaan ini belum dijawab.";
    else out.push({ questionId: Number(q.id), value });
  }
  if (Object.keys(fields).length) throw new ApiError(400, "Lengkapi semua pertanyaan prompt hari ini.", fields);
  return out;
}

/**
 * Menyimpan jurnal untuk tanggal aktif (lihat `getActiveDate`: prompt tertinggal dulu, lalu hari
 * ini, WIB). Satu entri per hari: mengirim lagi pada hari yang sama memperbarui entri tersebut. Ada prompt hari ini → semua pertanyaan wajib dijawab; tanpa
 * prompt → jurnal bebas (hanya Catatan Rasa).
 */
export async function submitEntry(userId: number, body: unknown): Promise<{ id: string }> {
  const input = submitSchema.parse(body);
  const activeDate = await getActiveDate(userId);
  const prompt = await getPromptForDate(activeDate);
  const answers = prompt ? serializeAnswers(prompt, input.answers) : [];
  const date = new Date(`${activeDate}T00:00:00Z`);
  const added: NewAttachment[] = input.attachments.added;
  if (input.attachments.keep.length + added.length > MAX_ATTACHMENTS)
    throw new ApiError(400, `Maksimal ${MAX_ATTACHMENTS} lampiran.`);
  const newRows = await verifyNewAttachments(userId, added);
  const promptId = prompt ? Number(prompt.id.replace(/\D/g, "")) : null;

  const removedKeys: string[] = [];
  const row = await db.$transaction(async (tx) => {
    const existing = await tx.promptResponse.findUnique({ where: { userId_date: { userId, date } }, select: { id: true } });
    const data = { promptId, content: input.content, shared: input.shared, answeredAt: new Date() };
    if (existing) await tx.promptAnswer.deleteMany({ where: { responseId: existing.id } });
    const saved = existing
      ? await tx.promptResponse.update({ where: { id: existing.id }, data })
      : await tx.promptResponse.create({ data: { ...data, userId, date } });
    if (answers.length)
      await tx.promptAnswer.createMany({ data: answers.map((a) => ({ ...a, responseId: saved.id })) });

    // Lampiran: buang yang tidak dipertahankan, lalu tambahkan berkas baru.
    const current = await tx.promptAttachment.findMany({ where: { responseId: saved.id } });
    const gone = current.filter((a) => !input.attachments.keep.includes(a.id));
    if (gone.length) {
      await tx.promptAttachment.deleteMany({ where: { id: { in: gone.map((a) => a.id) } } });
      removedKeys.push(...gone.flatMap((a) => (a.key ? [a.key] : [])));
    }
    if (newRows.length)
      await tx.promptAttachment.createMany({
        data: newRows.map((r) => ({
          kind: r.kind,
          title: r.title,
          key: r.key ?? null,
          size: r.size ?? null,
          meta: r.meta ?? null,
          responseId: saved.id,
        })),
      });
    return saved;
  });
  await deleteObjects(removedKeys);
  return { id: String(row.id) };
}
