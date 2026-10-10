import "server-only";
import type { CoacheeCare } from "@/data/coachee-care";
import { db } from "@/lib/db";
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
