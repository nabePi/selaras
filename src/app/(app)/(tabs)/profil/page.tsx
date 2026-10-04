import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { ProfileCard } from "@/components/profile-card";
import { buildWhatsappLink } from "@/data/programs";

export const metadata: Metadata = { title: "Profil" };

export default function ProfilPage() {
  return (
    <div className="mt-3 flex w-full flex-col gap-6">
      {/* 1. Kartu profil */}
      <ProfileCard />

      {/* 2. Bantuan & keluar */}
      <section className="mt-1 flex flex-col gap-1">
        <Link
          href={buildWhatsappLink(
            "Halo Tim Selaras, saya membutuhkan bantuan terkait akun dan program saya.",
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="t-title-sm flex w-full items-center justify-between rounded-2xl bg-surface-container-low px-4 py-3 text-on-surface shadow-xs transition-colors hover:bg-surface-container"
        >
          <span className="flex items-center gap-2">
            <Icon name="support_agent" size={20} className="text-primary" />
            <span>Hubungi Tim Selaras</span>
          </span>
          <Icon name="open_in_new" size={18} className="text-text-muted" />
        </Link>
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
