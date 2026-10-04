import Image from "next/image";
import Link from "next/link";
import {
  COMMUNITY_REFLECTIONS,
  FEATURED_STORY as F,
} from "@/data/stories";
import { Icon } from "./icon";

export function StoryFeed() {
  return (
    <>
      <section aria-label="Cerita Pilihan" className="mt-2 mb-6">
        <article className="flex flex-col gap-4 rounded-3xl bg-canvas-ivory p-5 shadow-[0_8px_24px_-4px_rgba(92,75,62,0.06)]">
          <div className="flex items-center justify-between">
            <span className="t-label-sm inline-flex items-center gap-1 rounded-full bg-sage-tint px-2.5 py-1 text-primary">
              <Icon name="auto_awesome" size={14} />
              Dari Instagram {F.sourceAccount}
            </span>
            <span className="t-label-sm text-text-muted">{F.context}</span>
          </div>
          <div className="relative h-64 w-full overflow-hidden rounded-2xl bg-surface-container">
            <Image
              src={F.cover}
              alt={F.coverAlt}
              fill
              sizes="(max-width: 480px) 100vw, 430px"
              className="object-cover object-top"
            />
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-inverse-surface/60 via-transparent to-transparent p-4">
              <div className="flex items-center gap-2">
                <Icon
                  name="favorite"
                  size={18}
                  filled
                  className="text-accent-sunray"
                />
                <span className="t-label-sm font-medium text-white">
                  {F.people}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="t-headline-md leading-snug font-medium text-on-surface">
              {F.title}
            </h2>
            <p className="t-body-sm text-text-muted">{F.summary}</p>
            <div className="flex gap-3 rounded-2xl bg-surface-container-low/80 p-3.5">
              <div className="w-1 shrink-0 rounded-full bg-secondary" />
              <p className="t-quote leading-relaxed text-on-surface-variant italic">
                “{F.quote}” — {F.quoteAuthor}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="t-body-sm flex items-center gap-2.5 text-text-muted">
              <span className="flex items-center gap-1">
                <Icon name="favorite" size={16} /> {F.likes}
              </span>
              <span className="flex items-center gap-1">
                <Icon name="chat_bubble" size={16} /> {F.comments}
              </span>
            </span>
            <Link
              href={F.source}
              target="_blank"
              rel="noopener noreferrer"
              className="t-title-sm inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-primary transition-colors hover:bg-sage-tint hover:underline"
            >
              <span>Baca Selengkapnya di Instagram</span>
              <Icon name="arrow_forward" size={16} />
            </Link>
          </div>
        </article>
      </section>

      <section
        aria-label="Refleksi dari Komunitas"
        className="mt-4 mb-6 flex flex-col gap-4"
      >
        <div className="flex items-center justify-between px-1">
          <h2 className="t-headline-sm text-on-surface">
            Refleksi dari Komunitas
          </h2>
          <span className="t-label-sm font-semibold text-primary">
            Instagram
          </span>
        </div>
        {COMMUNITY_REFLECTIONS.map((r) => (
          <article
            key={r.id}
            className="flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-4 shadow-[0_4px_16px_rgba(92,75,62,0.04)]"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="t-title-sm font-semibold text-on-surface">
                {r.handle}
              </span>
              <span className="t-body-sm flex items-center gap-1 text-text-muted">
                <Icon name="favorite" size={14} /> {r.likes}
              </span>
            </div>
            <p className="t-body-md text-on-surface-variant">{r.summary}</p>
            <div className="flex gap-3 rounded-2xl bg-surface p-3.5">
              <div className="w-1 shrink-0 rounded-full bg-sage-tint" />
              <p className="t-quote leading-relaxed text-on-surface-variant italic">
                “{r.quote}”
              </p>
            </div>
            <div className="flex items-start gap-2 rounded-xl bg-sage-tint/40 p-3">
              <Icon
                name="forum"
                size={16}
                className="mt-0.5 shrink-0 text-primary"
              />
              <p className="t-body-sm text-on-surface">
                “{r.responseQuote}”{" "}
                <span className="text-text-muted">— {r.responseAuthor}</span>
              </p>
            </div>
            <div className="flex items-center justify-end pt-1">
              <Link
                href={r.source}
                target="_blank"
                rel="noopener noreferrer"
                className="t-label-sm flex items-center gap-0.5 font-medium text-primary"
              >
                Lihat di Instagram <Icon name="chevron_right" size={14} />
              </Link>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
