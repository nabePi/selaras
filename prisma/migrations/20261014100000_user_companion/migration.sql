CREATE TYPE "UserCompanion" AS ENUM ('ANGGIT', 'EZIE');

ALTER TABLE "User" ADD COLUMN "companion" "UserCompanion";
