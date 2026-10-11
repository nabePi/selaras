import "server-only";
import { cache } from "react";
import { after } from "next/server";
import { db } from "@/lib/db";

const SEEN_EVERY_MS = 5 * 60_000;
/** Jeda tanpa aktivitas yang membuat akses berikutnya dihitung kunjungan baru. */
const VISIT_GAP_MS = 30 * 60_000;

async function record(userId: number) {
  try {
    const user = await db.user.findUnique({ where: { id: userId }, select: { lastSeenAt: true } });
    if (!user) return;
    const now = new Date();
    const prev = user.lastSeenAt;
    if (prev && now.getTime() - prev.getTime() < SEEN_EVERY_MS) return;
    // Hanya satu permintaan yang "memenangkan" pembaruan, jadi kunjungan tidak tercatat ganda.
    const claimed = await db.user.updateMany({ where: { id: userId, lastSeenAt: prev }, data: { lastSeenAt: now } });
    if (claimed.count && (!prev || now.getTime() - prev.getTime() >= VISIT_GAP_MS)) {
      await db.userVisit.create({ data: { userId, at: now } });
    }
  } catch (error) {
    console.error("[activity]", error);
  }
}

/** Mencatat akses peserta setelah respons terkirim (tidak memperlambat halaman); sekali per permintaan. */
export const trackMemberActivity = cache((userId: number) => {
  after(() => record(userId));
});
