-- AlterTable
ALTER TABLE "PromptAttachment" ADD COLUMN "key" TEXT,
ADD COLUMN "size" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "PromptAttachment_key_key" ON "PromptAttachment"("key");
