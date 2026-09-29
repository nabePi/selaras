import type { Metadata } from "next";
import Image from "next/image";
import { Icon } from "@/components/icon";
import { ProgramCatalog } from "@/components/program-catalog";
import { SectionHeading } from "@/components/section-heading";
import { MENTORS } from "@/data/programs";

export const metadata: Metadata = {
  title: "Program",
  description:
    "Katalog program pendampingan pasutri Selaras Life: cohort terpandu bersama psikolog keluarga muslim, jurnal harian 3 menit, dan telaah nilai syariah.",
  alternates: { canonical: "/program" },
};

const METHODS = [
  {
    icon: "groups",
    tone: "bg-sage-tint text-primary",
    title: "Live Interactive Gathering",
    body: "Dialog hangat 90 menit bersama psikolog, bedah studi kasus nyata, dan ruang tanya-jawab tanpa rasa sungkan.",
  },
  {
    icon: "edit_calendar",
    tone: "bg-secondary-container/50 text-secondary",
    title: "Habit Gating 3 Menit/Hari",
    body: "Prompt mikro harian di aplikasi web Selaras untuk memantik obrolan mendalam sebelum tidur (pillow-talk routine).",
  },
  {
    icon: "lock",
    tone: "bg-accent-sunray/30 text-on-surface",
    title: "Safe & Private Space",
    body: "Privasi refleksi terjamin. Jawaban jurnal hanya dapat dibaca oleh Anda dan pasutri Anda, kecuali jika dikirim untuk ulasan psikolog.",
  },
];

export default function ProgramPage() {
  return (
    <div className="flex w-full flex-col">
      <section className="flex flex-col pt-3 pb-6">
        <div className="mb-3 flex items-center gap-1.5 self-start rounded-full bg-sage-tint px-3 py-1 text-primary">
          <Icon name="eco" size={15} filled />
          <span className="t-label-sm font-semibold tracking-wider uppercase">
            Pendampingan Pasutri &amp; Keluarga
          </span>
        </div>
        <h1 className="t-headline-lg-mobile mb-3 leading-snug font-medium text-on-surface">
          Tumbuh Bertahap dalam Ikatan Cinta yang Diridhai
        </h1>
        <p className="t-body-md leading-relaxed text-text-muted">
          Sinergi bimbingan psikolog keluarga muslim, pembiasaan jurnal harian 3
          menit, serta telaah nilai syariah yang hangat dan memulihkan.
        </p>
        <div className="mt-5 flex items-center gap-3.5 rounded-2xl bg-canvas-ivory p-4 shadow-sm">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sage-tint text-primary">
            <Icon name="spa" size={20} />
          </span>
          <div className="flex flex-col">
            <span className="t-title-sm text-on-surface">
              Pondasi Berkah &amp; Jiwa Teduh
            </span>
            <span className="t-body-sm text-text-muted">
              Setiap cohort dibatasi maksimal 30 pasangan agar proses refleksi
              tetap mendalam.
            </span>
          </div>
        </div>
      </section>

      <ProgramCatalog />

      <section className="flex flex-col pb-8">
        <div className="mb-4">
          <SectionHeading
            align="center"
            eyebrow="Metode Khusus Selaras"
            title="Bukan Sekadar Kuliah Teori"
          />
        </div>
        <ul className="grid grid-cols-1 gap-3">
          {METHODS.map((m) => (
            <li
              key={m.title}
              className="flex items-start gap-3.5 rounded-2xl bg-canvas-ivory p-4 shadow-sm"
            >
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-2xl ${m.tone}`}
              >
                <Icon name={m.icon} size={20} />
              </span>
              <div className="flex flex-col">
                <h3 className="t-title-sm mb-0.5 font-semibold text-on-surface">
                  {m.title}
                </h3>
                <p className="t-body-sm text-text-muted">{m.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col pb-8">
        <div className="mb-4">
          <SectionHeading
            eyebrow="Fasilitator & Pengasuh"
            title="Didampingi dengan Hati & Ilmu"
          />
        </div>
        <ul className="flex flex-col gap-3.5">
          {MENTORS.map((m) => (
            <li
              key={m.name}
              className="flex items-center gap-3.5 rounded-2xl bg-canvas-ivory p-4 shadow-sm"
            >
              <Image
                src={m.image}
                alt={m.name}
                width={56}
                height={56}
                className="size-14 shrink-0 rounded-full object-cover"
              />
              <div className="flex min-w-0 flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="t-title-sm truncate font-semibold text-on-surface">
                    {m.name}
                  </span>
                  <Icon
                    name="verified"
                    size={16}
                    filled
                    className="shrink-0 text-primary"
                  />
                </div>
                <span className="t-label-sm font-medium text-secondary">
                  {m.role}
                </span>
                <span className="t-body-sm mt-0.5 line-clamp-2 text-text-muted">
                  {m.bio}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col pb-8">
        <figure className="relative flex flex-col gap-3 overflow-hidden rounded-3xl bg-sage-tint/40 p-5 shadow-sm">
          <div
            role="img"
            aria-label="Penilaian 5 dari 5 bintang"
            className="flex items-center gap-1 text-secondary"
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <Icon key={i} name="star" size={18} filled />
            ))}
          </div>
          <blockquote className="t-quote leading-relaxed text-on-surface italic">
            “Sesi 2 tentang jeda emosional dan pillow talk beneran mengubah cara
            kami meredakan salah paham. Rumah jadi tempat berpulang yang tenang,
            bukan arena adu benar.”
          </blockquote>
          <figcaption className="flex items-center justify-between gap-2 pt-1">
            <span className="t-title-sm font-semibold text-on-surface">
              Rian &amp; Sarah (Menikah 1,5 Tahun)
            </span>
            <span className="t-label-sm font-medium text-primary">
              Alumni Cohort 2
            </span>
          </figcaption>
        </figure>
      </section>

      <section className="mb-4 flex flex-col items-center rounded-3xl bg-canvas-ivory p-5 text-center shadow-sm">
        <span className="mb-3 flex size-12 items-center justify-center rounded-full bg-sage-tint text-primary">
          <Icon name="support_agent" size={24} />
        </span>
        <h2 className="t-title-lg mb-1 font-semibold text-on-surface">
          Masih Ragu Memilih Program?
        </h2>
        <p className="t-body-md mb-4 max-w-xs text-text-muted">
          Ceritakan kondisi pernikahan atau fase hubunganmu kepada tim
          pendamping Selaras untuk rekomendasi kurikulum yang paling selaras.
        </p>
        <button
          type="button"
          className="t-title-sm flex min-h-11 items-center gap-2 rounded-full bg-surface px-6 py-2.5 text-primary shadow-xs transition-colors hover:bg-surface-container-low"
        >
          <Icon name="chat" size={18} />
          <span>Konsultasi Singkat Gratis</span>
        </button>
      </section>
    </div>
  );
}
