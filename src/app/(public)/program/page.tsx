import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { ProgramCatalog } from "@/components/program-catalog";
import { SectionHeading } from "@/components/section-heading";
import { buildWhatsappLink } from "@/data/programs";

export const metadata: Metadata = {
  title: "Program",
  description:
    "Katalog program Selaras Life: kelas, coaching, dan pendampingan bersama konselor pernikahan-keluarga, aktivis dakwah, serta praktisi kehamilan & menyusui bersertifikat, agar keluarga kembali kepada fitrah.",
  alternates: { canonical: "/program" },
};

const METHODS = [
  {
    icon: "diversity_1",
    tone: "bg-sage-tint text-primary",
    title: "Dibimbing Konselor & Praktisi Bersertifikat",
    body: "Setiap kelas dan coaching dipandu konselor pernikahan & keluarga, konselor menyusui, hingga praktisi kehamilan tersertifikasi — bukan teori satu arah dari buku.",
  },
  {
    icon: "support_agent",
    tone: "bg-secondary-container/50 text-secondary",
    title: "Pendampingan via WhatsApp, Bukan Transaksi Sekali Jalan",
    body: "Nomor WhatsApp yang sama tersedia di setiap program untuk tanya-jawab sebelum mendaftar maupun pendampingan setelahnya, bukan sekadar beli kelas lalu dilepas sendiri.",
  },
  {
    icon: "auto_stories",
    tone: "bg-accent-sunray/30 text-on-surface",
    title: "Berpijak pada Fitrah & Wahyu",
    body: "Setiap materi menautkan ilmu praktis dengan nilai aqidah dan fitrah, agar keluarga tumbuh selaras wahyu, bukan sekadar mengikuti tren parenting atau relationship.",
  },
];

export default function ProgramPage() {
  return (
    <div className="flex w-full flex-col">
      <section className="flex flex-col pt-3 pb-6">
        <h1 className="t-headline-lg-mobile mb-3 leading-snug font-medium text-on-surface">
          Tumbuh Selaras Menuju Keluarga yang Diridhai Allah
        </h1>
        <p className="t-body-md leading-relaxed text-text-muted">
          Kelas dan coaching bersama konselor pernikahan &amp; keluarga,
          aktivis dakwah, serta praktisi kehamilan dan menyusui tersertifikasi
          — menemani perjalanan rumah tangga kembali kepada fitrah, selaras
          dengan wahyu.
        </p>
        <div className="mt-5 flex items-center gap-3.5 rounded-2xl bg-canvas-ivory p-4 shadow-sm">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sage-tint text-primary">
            <Icon name="spa" size={20} />
          </span>
          <div className="flex flex-col">
            <span className="t-title-sm text-on-surface">
              Rumah, Rahim &amp; Ruh
            </span>
            <span className="t-body-sm text-text-muted">
              Setiap program dirancang menghidupkan kembali peran rumah
              sebagai pusat pendidikan, rahim sebagai ladang ibadah, dan ruh
              yang senantiasa dekat kepada Allah.
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
        <Link
          href={buildWhatsappLink(
            "Halo Selaras Life, saya ingin konsultasi singkat untuk memilih program yang tepat.",
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="t-title-sm flex min-h-11 items-center gap-2 rounded-full bg-surface px-6 py-2.5 text-primary shadow-xs transition-colors hover:bg-surface-container-low"
        >
          <Icon name="chat" size={18} />
          <span>Konsultasi Singkat Gratis</span>
        </Link>
      </section>
    </div>
  );
}
