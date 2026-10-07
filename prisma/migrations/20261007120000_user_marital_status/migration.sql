-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('MENIKAH', 'BELUM_MENIKAH', 'CERAI_HIDUP', 'CERAI_MATI');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "maritalStatus" "MaritalStatus";
