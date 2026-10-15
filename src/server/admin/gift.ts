import "server-only";
import { db } from "@/lib/db";
import { giftAiConfig } from "@/lib/server/gift-ai";

export async function giftAdminOverview() {
  const [setting, total, likes, dislikes] = await Promise.all([
    db.giftSetting.findUnique({ where: { id: 1 } }),
    db.memberGift.count(),
    db.memberGift.count({ where: { feedback: "LIKE" } }),
    db.memberGift.count({ where: { feedback: "DISLIKE" } }),
  ]);
  return { enabled: setting?.enabled ?? false, total, likes, dislikes, ai: giftAiConfig() };
}

export async function setGiftEnabled(enabled: boolean) {
  return db.$transaction(async (tx) => {
    await tx.giftSetting.upsert({ where: { id: 1 }, create: { id: 1 }, update: {} });
    await tx.giftSetting.updateMany({
      where: { id: 1, enabled: !enabled },
      data: { enabled, ...(enabled ? { enabledAt: new Date() } : {}), version: { increment: 1 } },
    });
    const setting = await tx.giftSetting.findUniqueOrThrow({ where: { id: 1 } });
    return { enabled: setting.enabled };
  });
}
