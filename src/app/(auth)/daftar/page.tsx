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
      <FocusHeader centered title="Buat Akun" backHref="/" hideLogo />
      <div className="flex w-full flex-col pb-10">
        <div className="mt-2 mb-6 flex flex-col items-center text-center">
          <div className="relative mb-3 flex size-20 items-center justify-center rounded-2xl bg-canvas-ivory p-2 shadow-sm">
            <Image
              src="/images/logo-mark.png"
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
          <h1 className="t-headline-lg-mobile font-semibold tracking-tight text-on-surface">
            Mulai Perjalanan Sakinah
          </h1>
          <p className="t-body-md mt-1.5 max-w-[340px] leading-relaxed text-text-muted">
            Buat akun untuk memulai refleksi terpandu dan pendampingan keluarga bertumbuh dalam
            iman.
          </p>
        </div>

        <RegisterForm />

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
