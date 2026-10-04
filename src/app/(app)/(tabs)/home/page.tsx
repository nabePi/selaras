import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { WisdomActions } from "@/components/wisdom-actions";
import {
  DAILY_WISDOM,
  MEMBER,
  PENDING_REFLECTION as P,
  WEEK,
} from "@/data/member";

export const metadata: Metadata = { title: "Home" };

const DAY_STYLES = {
  done: {
    cell: "bg-sage-tint text-primary",
    label: "font-medium text-primary",
    badge: "bg-primary text-on-primary shadow-xs",
    icon: "check",
  },
  pending: {
    cell: "bg-secondary-container text-secondary",
    label: "font-semibold text-secondary",
    badge: "bg-secondary text-on-secondary shadow-xs",
    icon: "priority_high",
  },
  upcoming: {
    cell: "bg-surface-container-low text-text-muted opacity-70",
    label: "font-normal",
    badge: "bg-surface-container-high",
    icon: null,
  },
} as const;

const STATUS_TEXT = {
  done: "selesai",
  pending: "tertunda",
  upcoming: "belum waktunya",
} as const;

export default function HomePage() {
  return (
    <div className="flex w-full flex-col gap-6">
      {/* 1. Sapaan & streak */}
      <section className="mt-1 flex flex-col gap-1">
        <div className="mt-1">
          <h1 className="t-headline-lg-mobile text-on-surface">
            Assalamu’alaikum, {MEMBER.firstName} 🌿
          </h1>
        </div>
      </section>

      {/* 2. Hadis harian */}
      <section
        className="relative w-full overflow-hidden rounded-4xl bg-surface-container shadow-md"
        aria-label="Nasihat hari ini"
      >
        <div
          className="relative flex h-52 w-full flex-col justify-between bg-cover bg-center p-5"
          style={{ backgroundImage: "url('/images/wisdom-bg.jpg')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/90 via-inverse-surface/60 to-inverse-surface/30" />
          <div className="relative z-10 flex items-center justify-between">
            <span className="t-label-sm inline-flex items-center gap-1.5 rounded-full bg-surface-bright/90 px-3 py-1 text-on-surface backdrop-blur-md">
              <Icon name="auto_stories" size={14} filled className="text-primary" />
              Hadis Harian
            </span>
            <WisdomActions shareText={DAILY_WISDOM.shareText} />
          </div>
          <div className="relative z-10 flex flex-col gap-1.5">
            <p className="t-quote leading-relaxed text-surface-bright italic">
              “{DAILY_WISDOM.quote}”
            </p>
            <div className="flex items-center justify-between pt-1 text-surface-container-high/90">
              <span className="t-label-sm tracking-wide">
                {DAILY_WISDOM.source} • Nasihat Hari Ini
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-accent-sunray uppercase">
                {DAILY_WISDOM.theme}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Refleksi tertunda */}
      <section className="flex flex-col gap-2">
        <div className="flex flex-col gap-4 rounded-4xl bg-surface-container-low p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="size-2.5 animate-pulse rounded-full bg-accent-coral" />
              <span className="t-label-sm font-semibold tracking-wider text-secondary uppercase">
                Sesi {P.session} • Hari ke-{P.day} (Tertunda)
              </span>
            </div>
            <span className="t-label-sm rounded-full bg-surface-container-highest px-2.5 py-0.5 font-medium text-tertiary">
              ~{P.minutes} Menit
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="t-headline-sm leading-snug text-on-surface">{P.teaser}</h2>
            <p className="t-body-sm text-text-muted">{P.teaserNote}</p>
          </div>
          <Link
            href="/journal/tulis"
            className="t-title-sm flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 tracking-wide text-on-primary shadow-md transition-all hover:bg-primary-container active:scale-[0.99]"
          >
            <span>Tulis Jurnal Sekarang</span>
            <Icon name="arrow_forward" size={18} />
          </Link>
        </div>
      </section>

      {/* 4. Pita pekan */}
      <section className="flex flex-col gap-2 rounded-4xl bg-surface-container-lowest p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Icon name="calendar_month" size={18} className="text-primary" />
            <h2 className="t-title-sm text-on-surface">{WEEK.title}</h2>
          </div>
          <span className="t-label-sm text-text-muted">{WEEK.target}</span>
        </div>
        <ul className="grid grid-cols-7 gap-1.5 pt-1">
          {WEEK.days.map((d) => {
            const s = DAY_STYLES[d.status];
            return (
              <li
                key={d.label}
                className={`flex flex-col items-center gap-1 rounded-2xl p-2 ${s.cell}`}
              >
                <span className={`t-label-sm ${s.label}`}>
                  {d.label}
                  <span className="sr-only"> ({STATUS_TEXT[d.status]})</span>
                </span>
                <span
                  className={`flex size-7 items-center justify-center rounded-full ${s.badge}`}
                >
                  {s.icon ? (
                    <Icon name={s.icon} size={15} />
                  ) : (
                    <span className="size-1.5 rounded-full bg-text-muted/60" />
                  )}
                </span>
              </li>
            );
          })}
        </ul>
        <div className="mt-1 flex items-center gap-1.5 pt-2">
          <Icon name="spa" size={15} className="shrink-0 text-accent-coral" />
          <p className="t-body-sm text-text-muted">
            Tuntaskan hari tertunda agar ritme refleksi tetap mengalir selaras dan
            bermakna.
          </p>
        </div>
      </section>
    </div>
  );
}
