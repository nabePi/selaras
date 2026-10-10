import Link from "next/link";
import type { CoacheeCare } from "@/data/coachee-care";
import { Icon } from "./icon";

const PREVIEW = 1;

/** Coachee care dari coach untuk peserta, di atas riwayat refleksi. Hanya dirender bila ada isinya. */
export function JournalCoacheeCare({ items }: { items: CoacheeCare[] }) {
  return (
    <section aria-label="Coachee Care" className="flex flex-col gap-2">
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <Icon name="volunteer_activism" size={20} className="text-primary" />
          <h2 className="t-headline-sm text-on-surface">Coachee Care</h2>
        </div>
        <Link href="/coachee-care" className="t-label-md flex items-center gap-1 rounded-full px-2 py-1 text-primary transition-colors hover:bg-sage-tint">
          Lihat semua ({items.length})
          <Icon name="arrow_forward" size={15} />
        </Link>
      </div>
      {items.slice(0, PREVIEW).map((c) => (
        <Link
          key={c.id}
          href={`/coachee-care/${c.id}`}
          className="flex items-center gap-3 rounded-2xl bg-sage-tint p-3.5 shadow-sm transition-all hover:shadow-md active:scale-[0.99]"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
            <Icon name="volunteer_activism" size={20} />
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="t-title-sm line-clamp-2 text-on-surface">{c.title}</span>
            <span className="t-label-sm text-text-muted">
              {c.authorName} · {c.dateLabel}
            </span>
          </span>
          <Icon name="chevron_right" size={20} className="shrink-0 text-primary" />
        </Link>
      ))}
    </section>
  );
}
