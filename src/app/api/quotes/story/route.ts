import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { quoteStoryImage } from "@/components/quote-story-image";
import { quoteBackgroundForDate, quoteForDate } from "@/data/member";
import { todayWib } from "@/lib/server/time";
import { memberRoute } from "@/lib/server/route";
import { getQuoteForStory } from "@/server/member/quote";
import { z } from "zod";

export const GET = memberRoute(async ({ request, user }) => {
  // Pin the date to the visible card, including when the page stays open past midnight.
  const date = new URL(request.url).searchParams.get("date") ?? todayWib();
  const parsed = new Date(`${date}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsed.getTime()) || parsed.getTime() < 0 || parsed.toISOString().slice(0, 10) !== date) {
    return new Response("Tanggal kutipan tidak valid.", { status: 400 });
  }
  const quoteId = new URL(request.url).searchParams.get("quoteId");
  let quote = quoteForDate(date);
  if (quoteId !== null) {
    if (!z.string().uuid().safeParse(quoteId).success) return new Response("Kutipan tidak valid.", { status: 400 });
    const snapshot = await getQuoteForStory(user.id, date, quoteId);
    if (!snapshot) return new Response("Kutipan tidak ditemukan.", { status: 404 });
    quote = snapshot.text;
  }
  const [backgroundBytes, logoBytes] = await Promise.all([
    readFile(join(process.cwd(), "public", quoteBackgroundForDate(date))),
    readFile(join(process.cwd(), "public/images/logo-header.png")),
  ]);
  return quoteStoryImage({
    quote,
    background: `data:image/jpeg;base64,${backgroundBytes.toString("base64")}`,
    logo: `data:image/png;base64,${logoBytes.toString("base64")}`,
  });
});
