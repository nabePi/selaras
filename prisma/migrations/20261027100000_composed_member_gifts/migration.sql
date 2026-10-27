-- Persist the personal composition and the exact source material supplied to the LLM.
-- Existing gifts keep their original content until their period ends.
ALTER TABLE "MemberGift" ADD COLUMN "composition" JSONB;
