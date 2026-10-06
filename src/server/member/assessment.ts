import "server-only";
import { z } from "zod";
import type { AssessmentKind } from "@/data/assessment";
import { db } from "@/lib/db";
import { ApiError } from "@/lib/server/errors";
import { isAssessmentVisible, listItems } from "@/server/admin/assessment";

const KIND = { pre: "PRE", post: "POST" } as const;

export async function hasCompletedAssessment(userId: number, kind: AssessmentKind): Promise<boolean> {
  const row = await db.assessmentResponse.findUnique({
    where: { kind_userId: { kind: KIND[kind], userId } },
    select: { id: true },
  });
  return row !== null;
}

const submitSchema = z.object({
  answers: z.record(z.string(), z.number().int().min(1).max(5)),
});

/**
 * Menyimpan jawaban assessment peserta. Hanya boleh diisi sekali per jenis, dan semua soal
 * yang ada saat ini wajib dijawab (skala 1–5).
 */
export async function submitAssessment(userId: number, kind: AssessmentKind, body: unknown) {
  const { answers } = submitSchema.parse(body);
  if (!(await isAssessmentVisible(kind))) throw new ApiError(403, "Assessment ini belum dibuka.");
  const items = await listItems(kind);
  if (items.length === 0) throw new ApiError(409, "Belum ada soal pada assessment ini.");
  if (items.some((it) => answers[it.id] === undefined))
    throw new ApiError(400, "Jawab semua pertanyaan terlebih dahulu.");

  try {
    await db.assessmentResponse.create({
      data: {
        kind: KIND[kind],
        userId,
        answeredAt: new Date(),
        answers: { create: items.map((it) => ({ itemId: Number(it.id), value: answers[it.id] })) },
      },
    });
  } catch (error) {
    if ((error as { code?: string }).code === "P2002")
      throw new ApiError(409, "Kamu sudah mengisi assessment ini.");
    throw error;
  }
}
