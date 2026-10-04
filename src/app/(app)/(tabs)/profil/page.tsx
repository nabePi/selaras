import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ComingSoonButton } from "@/components/coming-soon-button";
import { Icon } from "@/components/icon";
import { MEMBER } from "@/data/member";

export const metadata: Metadata = { title: "Profil" };

export default function ProfilPage() {
  return (
    <div className="flex w-full flex-col gap-6">
      {/* 1. Kartu profil */}
      <section className="relative overflow-hidden rounded-4xl bg-surface-container-low p-4 shadow-sm">
        <div className="pointer-events-none absolute -right-6 -bottom-6 size-32 rounded-full bg-sage-tint/40" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="relative mb-2">
            <div className="flex size-20 items-center justify-center rounded-full bg-surface-bright p-1 shadow-sm">
              <Image
                src={MEMBER.avatar}
                alt={MEMBER.fullName}
                width={72}
                height={72}
                className="size-full rounded-full object-cover"
              />
            </div>
            <span className="absolute right-0 bottom-0 flex size-6 items-center justify-center rounded-full bg-primary text-on-primary shadow-sm">
              <Icon name="favorite" size={14} filled />
            </span>
          </div>
          <h1 className="t-headline-md text-on-surface">{MEMBER.fullName}</h1>
          <div className="mt-3 flex w-full flex-col gap-1.5">
            <div className="t-body-sm flex items-center justify-center gap-1.5 text-text-muted">
              <Icon name="chat" size={15} />
              {MEMBER.whatsapp}
            </div>
            <div className="t-body-sm flex items-center justify-center gap-1.5 text-text-muted">
              <Icon name="mail" size={15} />
              {MEMBER.email}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Bantuan & keluar */}
      <section className="mt-1 flex flex-col gap-1">
        <ComingSoonButton
          feature="Hubungi Fasilitator"
          className="t-title-sm flex w-full items-center justify-between rounded-2xl bg-surface-container-low px-4 py-3 text-on-surface shadow-xs transition-colors hover:bg-surface-container"
        >
          <span className="flex items-center gap-2">
            <Icon name="support_agent" size={20} className="text-primary" />
            <span>Hubungi Fasilitator &amp; Pendamping</span>
          </span>
          <Icon name="open_in_new" size={18} className="text-text-muted" />
        </ComingSoonButton>
        {/* Sementara mengarah ke beranda publik; ganti dengan aksi logout saat auth tersedia. */}
        <Link
          href="/"
          className="t-title-sm mt-1 flex w-full items-center gap-2 rounded-2xl bg-surface-container-low px-4 py-3 text-error shadow-xs transition-colors hover:bg-surface-container"
        >
          <Icon name="logout" size={20} />
          <span>Keluar dari Akun</span>
        </Link>
      </section>
    </div>
  );
}
