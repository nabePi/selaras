import Link from "next/link";
import type { CoacheeCare } from "@/data/coachee-care";
import { Icon } from "./icon";

/** Coachee care terbaru dari coach; klik membuka detailnya. Hanya dirender bila peserta punya coachee care. */
export function HomeCoacheeCare({ items }: { items: CoacheeCare[] }) {
  const latest = items[0];
  return (
    <section aria-label="Coachee Care" className="flex flex-col gap-2">
      <Link
        href={`/coachee-care/${latest.id}`}
        className="flex items-center gap-3 rounded-4xl bg-sage-tint p-4 shadow-sm transition-all hover:shadow-md active:scale-[0.99]"
      >
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
          <Icon name="volunteer_activism" size={24} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="t-label-sm font-semibold tracking-wider text-primary uppercase">Coachee Care · {latest.authorName}</span>
          <span className="t-title-sm line-clamp-2 text-on-surface">{latest.title}</span>
          <span className="t-label-sm text-text-muted">{latest.dateLabel}</span>
        </span>
        <Icon name="chevron_right" size={22} className="shrink-0 text-primary" />
      </Link>
    </section>
  );
}
