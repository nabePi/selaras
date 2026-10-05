import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { ShareButton } from "@/components/share-button";
import { StoryFeed } from "@/components/story-feed";
import { buildWhatsappLink } from "@/data/programs";
import { MENTOR_QUOTE } from "@/data/stories";

export const metadata: Metadata = {
  title: "Cerita",
  description:
    "Kisah nyata yang dibagikan langsung di Instagram Selaras Life & Selaras Laktasi — tentang kehamilan, persalinan, dan perjalanan menjemput fitrah.",
  alternates: { canonical: "/cerita" },
};

export default function CeritaPage() {
  return (
    <div className="flex w-full flex-col pb-8">
      <header className="flex flex-col gap-2 pt-2 pb-2">
        <h1 className="t-headline-lg-mobile tracking-tight text-on-surface">
          Jejak Langkah Menemukan Ketenangan Rumah Tangga
        </h1>
        <p className="t-body-md leading-relaxed text-text-muted">
          Kisah nyata yang dibagikan langsung oleh keluarga di Instagram
          Selaras Life &amp; Selaras Laktasi — tentang ikhtiar, ilmu, dan
          penyerahan diri kepada Allah.
        </p>
      </header>

      <StoryFeed />

      <section aria-label="Renungan Inspiratif" className="mb-6">
        <div className="relative flex flex-col gap-3 overflow-hidden rounded-3xl bg-surface-container p-5 shadow-sm">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-3 -bottom-3 text-tertiary-container/10"
          >
            <Icon name="spa" size={110} filled />
          </div>
          <div className="flex items-center gap-2">
            <Icon name="format_quote" size={20} className="text-secondary" />
            <span className="t-label-sm font-semibold tracking-wider text-secondary uppercase">
              Mutiara Penyejuk Hati
            </span>
          </div>
          <blockquote className="t-headline-sm z-10 leading-relaxed font-medium text-on-surface">
            “Sebaik-baik kalian adalah yang paling baik terhadap keluarganya,
            dan aku adalah orang yang paling baik terhadap keluargaku.”
          </blockquote>
          <div className="z-10 flex items-center justify-between pt-2">
            <span className="t-body-sm font-medium text-text-muted">
              HR. At-Tirmidzi no. 3895
            </span>
            <ShareButton
              title="Mutiara Hati Selaras Life"
              text="Sebaik-baik kalian adalah yang paling baik terhadap keluarganya... (HR. At-Tirmidzi)"
            />
          </div>
        </div>
      </section>

      <section aria-label="Catatan Pendamping Persalinan" className="mb-6">
        <div className="flex flex-col gap-3 rounded-3xl bg-sage-tint p-5 shadow-[0_4px_16px_rgba(78,97,72,0.06)]">
          <div className="flex items-center gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
              <Icon name="medical_services" size={22} />
            </span>
            <div className="flex flex-col">
              <h2 className="t-title-md font-semibold text-on-surface">
                {MENTOR_QUOTE.name}
              </h2>
              <span className="t-body-sm font-medium text-primary">
                {MENTOR_QUOTE.role}
              </span>
            </div>
          </div>
          <p className="t-body-md leading-relaxed text-on-surface-variant italic">
            “{MENTOR_QUOTE.quote}”
          </p>
          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="t-label-sm text-text-muted">
              Dikutip dari kisah Hira &amp; Lutfi di Instagram
            </span>
            <Link
              href={MENTOR_QUOTE.source}
              target="_blank"
              rel="noopener noreferrer"
              className="t-title-sm inline-flex shrink-0 items-center gap-1 text-primary hover:underline"
            >
              <span>Lihat Sumber</span>
              <Icon name="arrow_forward" size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section aria-label="Ajakan Bergabung" className="mt-2">
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-surface-container-high p-6 text-center shadow-sm">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icon name="edit_note" size={26} />
          </span>
          <div className="flex max-w-[340px] flex-col gap-1">
            <h2 className="t-headline-sm font-semibold text-on-surface">
              Ingin Memulai Langkah Kecil Bersama Pasanganmu?
            </h2>
            <p className="t-body-md leading-relaxed text-text-muted">
              Setiap rumah tangga memiliki waktu mekarnya masing-masing.
              Mulailah perjalanan saling memahami lewat cohort terpandu kami.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2.5 pt-2">
            <Link
              href="/program"
              className="t-title-sm flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-center text-on-primary shadow-md transition-all hover:bg-primary-container active:scale-[0.98]"
            >
              <span>Jelajahi Program Selaras</span>
              <Icon name="calendar_today" size={18} />
            </Link>
            <Link
              href={buildWhatsappLink(
                "Halo Selaras Life, saya ingin tanya-tanya seputar program Selaras.",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="t-title-sm rounded-full bg-surface-container px-4 py-2.5 text-center text-on-surface transition-colors hover:bg-surface-container-highest"
            >
              Tanya via WhatsApp
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
