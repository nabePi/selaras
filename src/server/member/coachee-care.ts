import "server-only";
import { z } from "zod";
import { CARE_REACTIONS, type CoacheeCare } from "@/data/coachee-care";
import { db } from "@/lib/db";
import { notFound } from "@/lib/server/errors";
import { toCare, withFiles } from "@/server/admin/coachee-care";

/** Coachee care yang diberikan admin untuk peserta ini, terbaru lebih dulu. */
export async function listMyCare(userId: number): Promise<CoacheeCare[]> {
  const rows = await db.coacheeCare.findMany({ where: { userId }, include: withFiles, orderBy: { createdAt: "desc" } });
  return Promise.all(rows.map(toCare));
}

export async function getMyCare(userId: number, id: string): Promise<CoacheeCare | null> {
  const n = Number(id);
  if (!Number.isSafeInteger(n) || n <= 0) return null;
  const row = await db.coacheeCare.findFirst({ where: { id: n, userId }, include: withFiles });
  return row ? toCare(row) : null;
}

/** Peserta memberi atau mengganti reaksi emoji; sekaligus menandai coachee care sudah dibaca. */
export async function reactToCare(userId: number, id: string, body: unknown): Promise<CoacheeCare> {
  const { emoji } = z.object({ emoji: z.enum(CARE_REACTIONS, { error: "Reaksi tidak valid." }) }).parse(body);
  const n = Number(id);
  const care = Number.isSafeInteger(n) && n > 0 ? await db.coacheeCare.findFirst({ where: { id: n, userId }, select: { id: true } }) : null;
  if (!care) throw notFound("Coachee care");
  const row = await db.coacheeCare.update({ where: { id: care.id }, data: { reaction: emoji, reactedAt: new Date() }, include: withFiles });
  return toCare(row);
}
