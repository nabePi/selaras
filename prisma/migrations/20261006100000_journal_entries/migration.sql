-- DropForeignKey
ALTER TABLE "PromptResponse" DROP CONSTRAINT "PromptResponse_promptId_fkey";

-- DropIndex
DROP INDEX "PromptResponse_userId_idx";

-- AlterTable
ALTER TABLE "PromptResponse"
  ALTER COLUMN "promptId" DROP NOT NULL,
  ADD COLUMN "date" DATE,
  ADD COLUMN "content" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "shared" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Isi tanggal entri lama dari tanggal tayang prompt-nya.
UPDATE "PromptResponse" r SET "date" = p."date" FROM "JournalPrompt" p WHERE p."id" = r."promptId";

ALTER TABLE "PromptResponse" ALTER COLUMN "date" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PromptResponse_userId_date_key" ON "PromptResponse"("userId", "date");

-- AddForeignKey
ALTER TABLE "PromptResponse" ADD CONSTRAINT "PromptResponse_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "JournalPrompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
