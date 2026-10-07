import "server-only";
import type { Course } from "@/data/courses";
import { db } from "@/lib/db";
import { toCourse, withSessions } from "@/server/admin/courses";

/** Kelas yang diikuti peserta (didaftarkan admin), terbaru dulu. */
export async function listMyCourses(userId: number): Promise<Course[]> {
  const rows = await db.course.findMany({
    where: { enrollments: { some: { userId } } },
    include: withSessions,
    orderBy: { createdAt: "desc" },
  });
  return Promise.all(rows.map(toCourse));
}

/** Satu kelas milik peserta; null bila tidak ada atau peserta tidak terdaftar di dalamnya. */
export async function getMyCourse(userId: number, id: string): Promise<Course | null> {
  const n = Number(id);
  if (!Number.isSafeInteger(n) || n <= 0) return null;
  const row = await db.course.findFirst({
    where: { id: n, enrollments: { some: { userId } } },
    include: withSessions,
  });
  return row ? toCourse(row) : null;
}
