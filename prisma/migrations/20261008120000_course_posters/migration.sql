-- AlterTable: satu poster menjadi daftar poster; poster lama dipindahkan.
ALTER TABLE "Course" ADD COLUMN "posterKeys" TEXT[];
UPDATE "Course" SET "posterKeys" = ARRAY["posterKey"] WHERE "posterKey" IS NOT NULL;
UPDATE "Course" SET "posterKeys" = ARRAY[]::TEXT[] WHERE "posterKeys" IS NULL;
ALTER TABLE "Course" ALTER COLUMN "posterKeys" SET NOT NULL;
ALTER TABLE "Course" DROP COLUMN "posterKey";
