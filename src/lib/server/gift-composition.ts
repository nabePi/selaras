import "server-only";
import { z } from "zod";
import type { GiftComposition } from "@/data/gifts";

const plain = (max: number) => z.string().trim().min(1).max(max).refine((s) => !/[<>]|https?:\/\//i.test(s));
// Direct religious quotations belong in the immutable source card. Arabic personal
// supplications have their own explicitly labelled field, separate from this prose.
export const giftProse = (max: number) => plain(max).refine((s) => !/[\u0600-\u06ff]|\b(?:Allah berfirman|Rasulullah bersabda|Nabi bersabda)\b/i.test(s));
export const compositionDraftSchema = z.object({
  paragraphs: z.array(giftProse(650).pipe(z.string().min(40))).min(2).max(3),
  closing: giftProse(300).pipe(z.string().min(20)),
  sourceIds: z.array(z.string().min(1)).min(1).max(3).refine((ids) => new Set(ids).size === ids.length),
}).strict();

const sourceUrl = z.url().refine((url) => {
  const parsed = new URL(url);
  return parsed.protocol === "https:" && ["quran.com", "sunnah.com", "tanzil.net", "dorar.net"].includes(parsed.hostname);
});
const storedSource = z.object({
  id: z.string(), kind: z.enum(["dua", "story", "quran", "hadith"]),
  title: z.string(), themes: z.array(z.string()),
  arabic: z.string().optional(), latin: z.string().optional(), meaning: z.string().optional(),
  paragraphs: z.array(z.string()).optional(),
  source: z.object({
    label: z.string(), url: sourceUrl, note: z.string(),
    additional: z.array(z.object({ label: z.string(), url: sourceUrl })).optional(),
  }),
});
const storedComposition = compositionDraftSchema.omit({ sourceIds: true }).extend({
  sources: z.array(storedSource).min(1).max(3),
});

/** Read a previously validated snapshot, retaining the original source text across releases. */
export function readGiftComposition(value: unknown, primaryId: string): GiftComposition | null {
  const parsed = storedComposition.safeParse(value);
  if (!parsed.success || parsed.data.sources[0].id !== primaryId) return null;
  return parsed.data;
}
