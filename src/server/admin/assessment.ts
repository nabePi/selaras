import "server-only";
import { cache } from "react";
import {
  ASSESSMENT_PARTS,
  type AssessmentItem,
  type AssessmentKind,
  type AssessmentPart,
} from "@/data/assessment";
import type { AssessmentResponse } from "@/data/assessment-responses";
import { db } from "@/lib/db";
import { userCode } from "@/lib/codes";
import { ApiError, notFound } from "@/lib/server/errors";
import { isoDateWib } from "@/lib/server/time";
import type { z } from "zod";
import type { assessmentItemSchema } from "./schemas";

type ItemInput = z.infer<typeof assessmentItemSchema>;

const KIND_IN = { pre: "PRE", post: "POST" } as const;
const PART_OUT = { MINDSET: "mindset", HABIT: "habit" } as const;
const PART_IN = { mindset: "MINDSET", habit: "HABIT" } as const;

const toItem = (r: { id: number; part: "MINDSET" | "HABIT"; dimension: string; text: string }): AssessmentItem => ({
  id: String(r.id),
  part: PART_OUT[r.part],
  dimension: r.dimension,
  text: r.text,
});

export const listItems = cache(async (kind: AssessmentKind): Promise<AssessmentItem[]> => {
  const rows = await db.assessmentItem.findMany({
    where: { kind: KIND_IN[kind] },
    orderBy: [{ position: "asc" }, { id: "asc" }],
  });
  return rows.map(toItem);
});

function parseItemId(id: string): number {
  const n = Number(id);
  if (!Number.isSafeInteger(n) || n <= 0) throw notFound("Soal");
  return n;
}

async function findItem(kind: AssessmentKind, id: string) {
  const row = await db.assessmentItem.findFirst({ where: { id: parseItemId(id), kind: KIND_IN[kind] } });
  if (!row) throw notFound("Soal");
  return row;
}

export async function createItem(kind: AssessmentKind, input: ItemInput): Promise<AssessmentItem> {
  const last = await db.assessmentItem.aggregate({ where: { kind: KIND_IN[kind] }, _max: { position: true } });
  const row = await db.assessmentItem.create({
    data: {
      kind: KIND_IN[kind],
      part: PART_IN[input.part],
      dimension: input.dimension,
      text: input.text,
      position: (last._max.position ?? -1) + 1,
    },
  });
  return toItem(row);
}

export async function updateItem(kind: AssessmentKind, id: string, input: ItemInput): Promise<AssessmentItem> {
  const existing = await findItem(kind, id);
  const row = await db.assessmentItem.update({
    where: { id: existing.id },
    data: { part: PART_IN[input.part], dimension: input.dimension, text: input.text },
  });
  return toItem(row);
}

/** Jawaban peserta pada soal ini ikut terhapus (cascade). */
export async function deleteItem(kind: AssessmentKind, id: string) {
  const existing = await findItem(kind, id);
  await db.assessmentItem.delete({ where: { id: existing.id } });
}

const average = (values: number[]) =>
  values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;

const participantWhere = { role: "MEMBER", status: "ACTIVE" } as const;

type UserLite = { id: number; name: string; avatarUrl: string | null };
type RespRow = { answeredAt: Date; answers: { itemId: number; value: number }[] };

function toResponse(user: UserLite, row: RespRow | undefined, items: AssessmentItem[]): AssessmentResponse {
  const base = { userId: userCode.format(user.id), name: user.name, avatar: user.avatarUrl ?? undefined };
  const answers: Record<string, number> = {};
  for (const a of row?.answers ?? []) answers[String(a.itemId)] = a.value;
  const byPart = (part: AssessmentPart) =>
    average(items.filter((it) => it.part === part).map((it) => answers[it.id]).filter(Boolean));
  const parts = Object.keys(ASSESSMENT_PARTS) as AssessmentPart[];
  const scores = Object.fromEntries(parts.map((p) => [p, row ? byPart(p) : null])) as AssessmentResponse["scores"];
  return { ...base, answeredAt: row ? isoDateWib(row.answeredAt) : null, answers, scores };
}

/** Satu entri per peserta aktif (urut id); yang belum mengisi punya `answeredAt: null`. */
export const getAssessmentResponses = cache(async (kind: AssessmentKind): Promise<AssessmentResponse[]> => {
  const [items, users, rows] = await Promise.all([
    listItems(kind),
    db.user.findMany({ where: participantWhere, orderBy: { id: "asc" }, select: { id: true, name: true, avatarUrl: true } }),
    db.assessmentResponse.findMany({
      where: { kind: KIND_IN[kind] },
      include: { answers: { select: { itemId: true, value: true } } },
    }),
  ]);
  const byUser = new Map(rows.map((r) => [r.userId, r]));
  return users.map((u) => toResponse(u, byUser.get(u.id), items));
});

export async function getAssessmentResponse(kind: AssessmentKind, userId: string) {
  return (await getAssessmentResponses(kind)).find((r) => r.userId === userId) ?? null;
}

/**
 * Apakah assessment ditampilkan ke peserta. Bila admin belum pernah mengaturnya: Pre tampil
 * (default), Post tersembunyi sampai dinyalakan.
 */
export async function isAssessmentVisible(kind: AssessmentKind): Promise<boolean> {
  const row = await db.assessmentSetting.findUnique({ where: { kind: KIND_IN[kind] } });
  return row?.visible ?? kind === "pre";
}

export async function setAssessmentVisible(kind: AssessmentKind, visible: boolean): Promise<void> {
  if (visible && (await listItems(kind)).length === 0)
    throw new ApiError(409, "Tambahkan minimal satu soal sebelum menampilkan assessment ke peserta.");
  await db.assessmentSetting.upsert({
    where: { kind: KIND_IN[kind] },
    create: { kind: KIND_IN[kind], visible },
    update: { visible },
  });
}
