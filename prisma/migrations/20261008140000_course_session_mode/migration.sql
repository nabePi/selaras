-- CreateEnum
CREATE TYPE "SessionMode" AS ENUM ('ONLINE', 'OFFLINE', 'HYBRID');

-- AlterTable
ALTER TABLE "CourseSession" ADD COLUMN "mode" "SessionMode" NOT NULL DEFAULT 'ONLINE',
ADD COLUMN "locationName" TEXT NOT NULL DEFAULT '',
ADD COLUMN "mapsUrl" TEXT NOT NULL DEFAULT '';
