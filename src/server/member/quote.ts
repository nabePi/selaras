import "server-only";
import { createHash } from "node:crypto";
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

/** Latest means the most recently saved/edited entry, including a backdated journal. */
export async function getHomeQuote(userId: number, date: string): Promise<HomeQuote> {
  const fallback = { text: quoteForDate(date) };
  if (!process.env.DEEPSEEK_API_KEY?.trim()) return fallback;
  const day = new Date(`${date}T00:00:00Z`);
  const journal = await db.promptResponse.findFirst({
    where: { userId },
    orderBy: [{ answeredAt: "desc" }, { id: "desc" }],
    select: {
      id: true, updatedAt: true, content: true,
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

  const sourceHash = createHash("sha256").update(JSON.stringify({
    version: 1, model: process.env.DEEPSEEK_MODEL?.trim() || "deepseek-flash",
    id: journal.id, updatedAt: journal.updatedAt.toISOString(), context,
  })).digest("hex");
  const key = `${userId}:${date}:${sourceHash}`;
  const unique = { userId_date_sourceHash: { userId, date: day, sourceHash } };
  const saved = await db.dailyQuote.findUnique({ where: unique, select: { id: true, text: true } });
  if (saved) return saved;
  if ((failures.get(key) ?? 0) > Date.now()) return fallback;
  const running = pending.get(key);
  if (running) return running;

  const task = Promise.resolve().then(async () => {
    try {
      rateLimit(`quote-ai:${userId}`, 12, 3_600_000);
      const text = await generateJournalQuote(boundedContext(context));
      return await db.dailyQuote.upsert({
        where: unique,
        create: { userId, date: day, sourceId: journal.id, sourceHash, text },
        update: {},
        select: { id: true, text: true },
      });
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

/** Look up the exact card snapshot, scoped to the authenticated owner and card date. */
export async function getQuoteForStory(userId: number, date: string, id: string) {
  return db.dailyQuote.findFirst({
    where: { id, userId, date: new Date(`${date}T00:00:00Z`) },
    select: { text: true },
  });
}
