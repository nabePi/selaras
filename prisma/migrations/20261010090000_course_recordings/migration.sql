-- CreateTable
CREATE TABLE "CourseRecording" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "size" BIGINT NOT NULL,

    CONSTRAINT "CourseRecording_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CourseRecording_key_key" ON "CourseRecording"("key");

-- AddForeignKey
ALTER TABLE "CourseRecording" ADD CONSTRAINT "CourseRecording_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "CourseSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Pindahkan rekaman lama (satu per sesi) ke tabel baru
INSERT INTO "CourseRecording" ("sessionId", "title", "name", "key", "size")
SELECT "id", COALESCE("recordingName", 'Rekaman'), COALESCE("recordingName", 'Rekaman'), "recordingKey", COALESCE("recordingSize", 0)
FROM "CourseSession" WHERE "recordingKey" IS NOT NULL;

-- AlterTable
ALTER TABLE "CourseSession" DROP COLUMN "recordingKey",
DROP COLUMN "recordingName",
DROP COLUMN "recordingSize";
