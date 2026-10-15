CREATE TABLE "DailyQuote" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "sourceId" INTEGER NOT NULL,
    "sourceHash" TEXT NOT NULL,
    "text" VARCHAR(180) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DailyQuote_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DailyQuote_userId_date_sourceHash_key" ON "DailyQuote"("userId", "date", "sourceHash");
CREATE INDEX "DailyQuote_sourceId_idx" ON "DailyQuote"("sourceId");
ALTER TABLE "DailyQuote" ADD CONSTRAINT "DailyQuote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DailyQuote" ADD CONSTRAINT "DailyQuote_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "PromptResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
