CREATE TABLE "GiftSetting" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "enabledAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GiftSetting_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MemberGift" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "settingVersion" INTEGER NOT NULL,
    "periodStart" DATE NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "contentId" TEXT NOT NULL,
    "intro" VARCHAR(700) NOT NULL,
    "prayerArabic" TEXT,
    "prayerLatin" TEXT,
    "prayerMeaning" TEXT,
    "feedback" TEXT,
    "aiProvider" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MemberGift_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "MemberGift_feedback_check" CHECK ("feedback" IS NULL OR "feedback" IN ('LIKE', 'DISLIKE'))
);

CREATE UNIQUE INDEX "MemberGift_userId_settingVersion_periodStart_key" ON "MemberGift"("userId", "settingVersion", "periodStart");
CREATE INDEX "MemberGift_userId_createdAt_idx" ON "MemberGift"("userId", "createdAt");
ALTER TABLE "MemberGift" ADD CONSTRAINT "MemberGift_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
