import { quoteBackgroundForDate } from "@/data/member";
import { getHomeQuote, type HomeQuote as Quote } from "@/server/member/quote";
import { StoryShare } from "./story-share";

export function HomeQuoteCard({ date, quote }: { date: string; quote: Quote }) {
  const background = quoteBackgroundForDate(date);
  const params = new URLSearchParams({ date, v: background });
  if (quote.id) params.set("quoteId", quote.id);
  return (
    <section className="relative w-full overflow-hidden rounded-4xl bg-surface-container shadow-md" aria-label="Kutipan hari ini">
      <StoryShare path="/home" imagePath={`/api/quotes/story?${params}`} kind="quote" />
      <div
        className="relative flex min-h-52 w-full items-center justify-center bg-cover bg-center px-6 py-8"
        style={{ backgroundImage: `url('${background}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-inverse-surface/55 to-inverse-surface/35" />
        <p className="t-quote relative z-10 max-w-sm text-center leading-relaxed text-surface-bright italic">“{quote.text}”</p>
      </div>
    </section>
  );
}

export async function HomeQuote({ userId, date, fallback }: { userId: number; date: string; fallback: Quote }) {
  const quote = await getHomeQuote(userId, date).catch(() => fallback);
  return <HomeQuoteCard date={date} quote={quote} />;
}
