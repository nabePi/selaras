-- Nullable fields preserve gifts already opened in the current three-day period.
ALTER TABLE "MemberGift"
  ADD COLUMN "personalTitle" VARCHAR(120),
  ADD COLUMN "reflection" VARCHAR(400),
  ADD COLUMN "smallStep" VARCHAR(400),
  ADD COLUMN "personalization" JSONB;
