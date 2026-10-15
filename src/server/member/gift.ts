import "server-only";
import { createHash } from "node:crypto";
import type { MemberGift } from "@/generated/prisma/client";
import { GIFT_CONTENT, type GiftDto } from "@/data/gifts";
import { db } from "@/lib/db";
import { giftPeriod } from "@/lib/gift-period";
import { ApiError } from "@/lib/server/errors";
import { generateGift, giftAiConfig } from "@/lib/server/gift-ai";
import { rateLimit } from "@/lib/server/rate-limit";
import { todayWib } from "@/lib/server/time";
import { richToPlain } from "@/lib/rich-text";

const pending = new Map<string, Promise<GiftDto>>();
const genericIntro = "Di antara hari-hari yang kamu jalani, semoga ada ruang kecil untuk berhenti dan merawat hati. Hadiah ini dipilih untuk menemani jedamu, bukan untuk menilai perasaan atau perjalananmu. Bacalah perlahan, sebisamu, tanpa perlu terburu-buru.";
const journalExcerpt = (text: string) => text.length <= 4000 ? text : `${text.slice(0, 2000)}\n[…]\n${text.slice(-2000)}`;

export async function giftSetting() {
  return db.giftSetting.findUnique({ where: { id: 1 } });
}

async function requireEnabled() {
  const setting = await giftSetting();
  if (!setting?.enabled || !setting.enabledAt) throw new ApiError(403, "Gift sedang diistirahatkan. Kamu tetap bisa melanjutkan jurnalmu.");
  return setting as typeof setting & { enabledAt: Date };
}

function dto(gift: MemberGift): GiftDto {
  const content = GIFT_CONTENT.find((c) => c.id === gift.contentId);
  if (!content) throw new ApiError(404, "Hadiah belum tersedia.");
  return {
    id: gift.id, intro: gift.intro, content,
    personalPrayer: gift.prayerArabic && gift.prayerLatin && gift.prayerMeaning
      ? { arabic: gift.prayerArabic, latin: gift.prayerLatin, meaning: gift.prayerMeaning } : null,
    expiresAt: gift.expiresAt.toISOString(),
    feedback: gift.feedback === "LIKE" || gift.feedback === "DISLIKE" ? gift.feedback : null,
  };
}

/** Reads only: never invokes AI or accesses profile/journals from the Home card. */
export async function currentGift(userId: number): Promise<GiftDto | null> {
  const setting = await requireEnabled();
  const period = giftPeriod(setting.enabledAt);
  const gift = await db.memberGift.findUnique({
    where: { userId_settingVersion_periodStart: { userId, settingVersion: setting.version, periodStart: period.start } },
  });
  return gift ? dto(gift) : null;
}

async function contextFor(userId: number) {
  const [profile, journals] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { activities: true, skills: true, maritalStatus: true } }),
    db.promptResponse.findMany({
      where: { userId, date: { lte: new Date(`${todayWib()}T00:00:00Z`) } },
      take: 5, orderBy: [{ date: "desc" }, { answeredAt: "desc" }],
      select: {
        date: true, content: true,
        answers: { orderBy: { question: { position: "asc" } }, select: { value: true, question: { select: { label: true } } } },
      },
    }),
  ]);
  return {
    profil: profile,
    jurnal: journals.map((j) => ({
      tanggal: j.date.toISOString().slice(0, 10),
      isi: journalExcerpt([j.content, ...j.answers.map((a) => `${richToPlain(a.question.label)}: ${a.value}`)].join("\n")),
    })),
  };
}

/** One persisted gift per participant, activation version and three-day WIB period. */
export async function openGift(userId: number): Promise<GiftDto> {
  const setting = await requireEnabled();
  const period = giftPeriod(setting.enabledAt);
  const unique = { userId_settingVersion_periodStart: { userId, settingVersion: setting.version, periodStart: period.start } };
  const saved = await db.memberGift.findUnique({ where: unique });
  if (saved) return dto(saved);
  const key = `${userId}:${setting.version}:${period.start.toISOString()}`;
  const running = pending.get(key);
  if (running) return running;
  const task = Promise.resolve().then(async () => {
    const recent = await db.memberGift.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 3, select: { contentId: true } });
    const candidates = GIFT_CONTENT.filter((c) => !recent.some((r) => r.contentId === c.id));
    const offset = createHash("sha256").update(key).digest().readUInt32BE(0) % candidates.length;
    let selection: Awaited<ReturnType<typeof generateGift>> = { contentId: candidates[offset].id, intro: genericIntro, personalPrayer: null, provider: "fallback" };
    if (giftAiConfig().configured) {
      try {
        rateLimit(`gift-ai:${userId}`, 6, 3_600_000);
        selection = await generateGift(await contextFor(userId), candidates);
      } catch {
        // Sacred texts always come from the collection, including when a provider is unavailable.
      }
    }
    const gift = await db.$transaction(async (tx) => {
      // This conditional update locks the switch until commit. A concurrent disable wins first or waits.
      const locked = await tx.giftSetting.updateMany({ where: { id: 1, enabled: true, version: setting.version }, data: { enabled: true } });
      if (!locked.count) throw new ApiError(403, "Gift sedang diistirahatkan. Silakan kembali ke Home.");
      if (Date.now() >= period.expiresAt.getTime()) throw new ApiError(409, "Periode hadiah telah berganti. Silakan buka lagi untuk hadiah barumu.");
      return tx.memberGift.upsert({
        where: unique, update: {},
        create: {
          userId, settingVersion: setting.version, periodStart: period.start, expiresAt: period.expiresAt,
          contentId: selection.contentId, intro: selection.intro,
          prayerArabic: selection.personalPrayer?.arabic, prayerLatin: selection.personalPrayer?.latin,
          prayerMeaning: selection.personalPrayer?.meaning, aiProvider: selection.provider,
        },
      });
    }).catch((error: unknown) => {
      if (error instanceof ApiError) throw error;
      // Prisma validation errors can embed create data. Keep personal introductions out of API logs.
      throw new ApiError(500, "Hadiahmu belum bisa disimpan. Silakan coba lagi sebentar.");
    });
    return dto(gift);
  }).finally(() => pending.delete(key));
  pending.set(key, task);
  return task;
}

export async function giftFeedback(userId: number, id: string, vote: "LIKE" | "DISLIKE" | null) {
  const setting = await requireEnabled();
  const updated = await db.memberGift.updateMany({
    where: { id, userId, settingVersion: setting.version, expiresAt: { gt: new Date() } }, data: { feedback: vote },
  });
  if (!updated.count) throw new ApiError(404, "Hadiah tidak ditemukan atau periodenya sudah berganti.");
  return { feedback: vote };
}
