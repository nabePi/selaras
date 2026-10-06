import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { LogoutButton } from "@/components/logout-button";
import { ProfileCard } from "@/components/profile-card";
import { ActivitiesCard } from "@/components/activities-card";
import { SkillsCard } from "@/components/skills-card";
import { buildWhatsappLink } from "@/data/programs";
import { requireMemberPage } from "@/lib/server/session";
import { getProfile } from "@/server/member/profile";

export const metadata: Metadata = { title: "Profil" };

export default async function ProfilPage() {
  const user = await requireMemberPage();
  const profile = await getProfile(user.id);

  return (
    <div className="mt-3 flex w-full flex-col gap-6">
      {/* 1. Kartu profil */}
      <ProfileCard profile={profile} />

      {/* 2. Potensi & keahlian */}
      <SkillsCard initialSkills={profile.skills} />

      {/* 3. Kegiatan sehari-hari */}
      <ActivitiesCard initial={profile.activities} />

      {/* 4. Bantuan & keluar */}
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
        <LogoutButton />
      </section>
    </div>
  );
}
