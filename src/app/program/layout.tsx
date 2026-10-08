import { AppBottomNav } from "@/components/app-bottom-nav";
import { AppHeader } from "@/components/app-header";
import { BackToTop } from "@/components/back-to-top";
import { BottomNav } from "@/components/bottom-nav";
import { PhoneShell } from "@/components/phone-shell";
import { SiteHeader } from "@/components/site-header";
import { getSessionUser } from "@/lib/server/session";

/**
 * Katalog program terbuka untuk semua pengunjung. Peserta yang sudah masuk melihat header dan
 * navigasi bawah member (Home, Journal, Program, Profil) agar konteksnya tidak berpindah; pengunjung
 * melihat header dan navigasi publik.
 */
export default async function ProgramLayout({ children }: LayoutProps<"/">) {
  const user = await getSessionUser("member");
  const member = user?.status === "ACTIVE";

  return (
    <PhoneShell>
      {member ? <AppHeader /> : <SiteHeader />}
      <main className="flex w-full flex-1 flex-col px-margin pt-16 pb-28">{children}</main>
      <BackToTop />
      {member ? <AppBottomNav /> : <BottomNav />}
    </PhoneShell>
  );
}
