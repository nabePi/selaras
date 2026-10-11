-- AlterTable
ALTER TABLE "User" ADD COLUMN "lastSeenAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "UserVisit" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserVisit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserVisit_userId_at_idx" ON "UserVisit"("userId", "at");

-- AddForeignKey
ALTER TABLE "UserVisit" ADD CONSTRAINT "UserVisit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Riwayat sebelum pelacakan: waktu masuk (login) tersimpan di Session dianggap kunjungan.
INSERT INTO "UserVisit" ("userId", "at")
SELECT s."userId", s."createdAt" FROM "Session" s JOIN "User" u ON u."id" = s."userId" WHERE u."role" = 'MEMBER';

UPDATE "User" u SET "lastSeenAt" = v."last" FROM (SELECT "userId", MAX("at") AS "last" FROM "UserVisit" GROUP BY "userId") v WHERE v."userId" = u."id";
