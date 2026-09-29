import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { ComingSoonButton } from "@/components/coming-soon-button";
import { FocusHeader } from "@/components/focus-header";
import { Icon } from "@/components/icon";

export const metadata: Metadata = {
  title: "Masuk",
  description: "Masuk ke Selaras Life untuk melanjutkan refleksi harian bersama pasangan.",
  alternates: { canonical: "/masuk" },
  robots: { index: false, follow: true },
};

export default function MasukPage() {
  return (
    <>
      <FocusHeader centered title="Masuk" backHref="/" />
      <div className="flex w-full flex-col pb-10">
        <div className="flex w-full items-center justify-center py-2">
          <div className="t-label-sm inline-flex items-center gap-2 rounded-full bg-sage-tint px-3 py-1 font-normal text-on-surface-variant shadow-sm">
            <Icon name="spa" size={15} filled className="text-primary" />
            <span>Ruang Teduh • Tumbuh Berdua dalam Ridha-Nya</span>
          </div>
        </div>

        <div className="mt-3 mb-6 flex flex-col items-center px-1 text-center">
          <div className="relative mb-3 flex size-20 items-center justify-center rounded-2xl bg-canvas-ivory p-2 shadow-sm">
            <Image
              src="/images/logo-avatar.png"
              alt="Logo Selaras Life"
              width={64}
              height={64}
              priority
              className="size-full object-contain"
            />
            <span className="absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full bg-accent-coral shadow-xs">
              <Icon name="favorite" size={12} className="text-surface" />
            </span>
          </div>
          <h1 className="t-headline-lg-mobile mb-1 tracking-tight text-on-surface">
            Selamat Datang Kembali
          </h1>
          <p className="t-body-md max-w-[320px] leading-relaxed text-text-muted">
            Lanjutkan langkah hening dan refleksi bertumbuh bersama pasangan.
          </p>
        </div>

        <LoginForm />

        <aside className="mt-6 flex items-start gap-3 rounded-3xl bg-surface-container-high/60 p-4 shadow-sm">
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary-fixed-dim/60 text-secondary">
            <Icon name="verified_user" size={18} />
          </span>
          <div className="flex flex-col">
            <h2 className="t-title-sm font-semibold text-secondary">Peserta Cohort Aktif?</h2>
            <p className="t-body-sm mt-0.5 leading-relaxed text-on-surface-variant">
              Pastikan masuk menggunakan nomor WhatsApp atau email yang didaftarkan saat aktivasi
              program agar progres jurnal &amp; refleksi harian tersinkronisasi otomatis.
            </p>
          </div>
        </aside>

        <figure className="mt-5 flex items-center gap-3.5 rounded-3xl bg-canvas-ivory p-4 shadow-sm">
          <Image
            src="/images/auth-habit.jpg"
            alt="Cahaya pagi menyinari dua cangkir teh dan jurnal di atas meja kayu"
            width={56}
            height={56}
            className="size-14 shrink-0 rounded-2xl object-cover shadow-inner"
          />
          <div className="flex flex-col">
            <span className="t-label-sm font-medium tracking-wide text-primary">SELARAS HABIT</span>
            <blockquote className="t-body-sm font-serif leading-snug text-on-surface italic">
              “Saling memandang dengan cinta, bertumbuh dalam keheningan doa.”
            </blockquote>
          </div>
        </figure>

        <div className="mt-7 flex flex-col items-center gap-3 text-center">
          <div className="t-body-md text-text-muted">
            Belum memiliki akun?
            <Link
              href="/daftar"
              className="t-title-sm ml-1 font-semibold text-primary underline decoration-primary/40 underline-offset-4 hover:text-on-primary-fixed-variant"
            >
              Daftar Sekarang
            </Link>
          </div>
          <ComingSoonButton
            feature="Layanan Coach via WhatsApp"
            className="t-label-md inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-text-muted transition-colors hover:text-on-surface"
          >
            <Icon name="support_agent" size={15} className="text-tertiary" />
            <span>Butuh bantuan coach? Hubungi Tim Selaras</span>
          </ComingSoonButton>
        </div>
      </div>
    </>
  );
}
