import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { FocusHeader } from "@/components/focus-header";
import { Icon } from "@/components/icon";

export const metadata: Metadata = {
  title: "Buat Akun",
  description:
    "Buat akun Selaras Life untuk memulai refleksi terpandu dan pendampingan keluarga bertumbuh dalam iman.",
  alternates: { canonical: "/daftar" },
};

export default function DaftarPage() {
  return (
    <>
      <FocusHeader centered title="Buat Akun" backHref="/" />
      <div className="flex w-full flex-col pb-10">
        <div className="mt-2 mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex size-20 items-center justify-center rounded-full bg-canvas-ivory p-2 shadow-sm">
            <Image
              src="/images/logo-avatar.png"
              alt="Selaras Life"
              width={64}
              height={64}
              priority
              className="size-full object-contain"
            />
          </div>
          <div className="t-label-sm mb-2 inline-flex items-center gap-1.5 rounded-full bg-secondary-container/40 px-3 py-1 tracking-wider text-on-secondary-container uppercase">
            <Icon name="spa" size={14} />
            <span>Langkah Menuju Ketenangan</span>
          </div>
          <h1 className="t-headline-lg-mobile font-semibold tracking-tight text-on-surface">
            Mulai Perjalanan Sakinah
          </h1>
          <p className="t-body-md mt-1.5 max-w-[340px] leading-relaxed text-text-muted">
            Buat akun untuk memulai refleksi terpandu dan pendampingan keluarga bertumbuh dalam
            iman.
          </p>
        </div>

        <RegisterForm />

        <aside className="mt-6 flex items-start gap-3 rounded-3xl bg-surface-container-high/60 p-4 shadow-sm">
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-secondary">
            <Icon name="verified_user" size={18} />
          </span>
          <div className="flex flex-col">
            <h2 className="t-title-sm font-semibold text-secondary">Alur Verifikasi Cohort</h2>
            <p className="t-body-sm mt-0.5 leading-relaxed text-on-surface-variant">
              Setelah mendaftar, akun Anda akan terdaftar sebagai{" "}
              <span className="font-semibold text-on-surface">Registered User</span>. Untuk
              membuka fitur Journaling Harian Cohort, Tim Pendamping akan memverifikasi dan
              mengaktifkan akses Anda secara bertahap.
            </p>
          </div>
        </aside>

        <div className="mt-8 flex items-center justify-center gap-1.5 text-center">
          <span className="t-body-md text-text-muted">Sudah memiliki akun?</span>
          <Link
            href="/masuk"
            className="t-title-md flex items-center gap-0.5 font-semibold text-primary hover:underline"
          >
            <span>Masuk di sini</span>
            <Icon name="arrow_forward" size={16} />
          </Link>
        </div>
      </div>
    </>
  );
}
