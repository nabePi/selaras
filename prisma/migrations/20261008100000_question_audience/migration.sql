-- CreateEnum
CREATE TYPE "QuestionAudience" AS ENUM ('SEMUA', 'MENIKAH', 'BELUM_MENIKAH');

-- AlterTable
ALTER TABLE "PromptQuestion" ADD COLUMN "audience" "QuestionAudience" NOT NULL DEFAULT 'SEMUA';
