import "server-only";
import { db } from "@/lib/db";
import { quoteForDate } from "@/data/member";
import { generateJournalQuote } from "@/lib/server/quote-ai";
import { rateLimit } from "@/lib/server/rate-limit";
import { richToPlain } from "@/lib/rich-text";

export type HomeQuote = { text: string; id?: string };

const pending = new Map<string, Promise<HomeQuote>>();
const failures = new Map<string, number>();

function boundedContext(text: string) {
  // Preserve both the opening context and the final feelings in very long entries.
  return text.length <= 20_000 ? text : `${text.slice(0, 10_000)}\n[…]\n${text.slice(-10_000)}`;
}

/** Reuse the day's first quote; journal changes only inform the next day's quote. */
export async function getHomeQuote(userId: number, date: string): Promise<HomeQuote> {
  const fallback = { text: quoteForDate(date) };
  const day = new Date(`${date}T00:00:00Z`);
  // Include legacy revision-based snapshots without deleting shared story cards.
  const saved = await db.dailyQuote.findFirst({
    where: { userId, date: day },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    select: { id: true, text: true },
  });
  if (saved) return saved;
  if (!process.env.DEEPSEEK_API_KEY?.trim()) return fallback;

  const key = `${userId}:${date}`;
  if ((failures.get(key) ?? 0) > Date.now()) return fallback;
  const running = pending.get(key);
  if (running) return running;

  const task = Promise.resolve().then(async () => {
    try {
      return await generateDailyQuote(userId, day, fallback);
    } catch {
      // Briefly back off on provider/validation failures; do not store a default as an AI quote.
      if (failures.size >= 1000) failures.clear();
      failures.set(key, Date.now() + 300_000);
      return fallback;
    }
  }).finally(() => pending.delete(key));
  pending.set(key, task);
  return task;
}

async function generateDailyQuote(userId: number, day: Date, fallback: HomeQuote): Promise<HomeQuote> {
  // Latest means the most recently saved/edited entry, including a backdated journal.
  const journal = await db.promptResponse.findFirst({
    where: { userId },
    orderBy: [{ answeredAt: "desc" }, { id: "desc" }],
    select: {
      id: true, content: true,
      answers: {
        where: { question: { type: { in: ["TEXT", "MOOD", "CHOICE", "SCALE"] } } },
        orderBy: { question: { position: "asc" } },
        select: { value: true, question: { select: { label: true } } },
      },
    },
  });
  if (!journal) return fallback;
  const context = [
    journal.content.trim(),
    ...journal.answers.filter((answer) => answer.value.trim()).map((answer) => `${richToPlain(answer.question.label)}: ${answer.value}`),
  ].filter(Boolean).join("\n\n");
  if (!context) return fallback;

  // This legacy column now holds a fixed daily key. The existing unique index
  // makes requests from separate server instances converge on the same snapshot.
  const sourceHash = "daily-v1";
  const unique = { userId_date_sourceHash: { userId, date: day, sourceHash } };
  rateLimit(`quote-ai:${userId}`, 12, 3_600_000);
  const text = await generateJournalQuote(boundedContext(context));
  return db.dailyQuote.upsert({
    where: unique,
    create: { userId, date: day, sourceId: journal.id, sourceHash, text },
    update: {},
    select: { id: true, text: true },
  });
}

/** Look up the exact card snapshot, scoped to the authenticated owner and card date. */
export async function getQuoteForStory(userId: number, date: string, id: string) {
  return db.dailyQuote.findFirst({
    where: { id, userId, date: new Date(`${date}T00:00:00Z`) },
    select: { text: true },
  });
}
