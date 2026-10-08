import { AppBottomNav } from "@/components/app-bottom-nav";
import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";
import { PhoneShell } from "@/components/phone-shell";
import { SiteHeader } from "@/components/site-header";
import { getSessionUser } from "@/lib/server/session";

/**
 * Halaman publik (Beranda, Cerita, Blog). Peserta yang sudah masuk melihat header dan navigasi member
 * agar tidak disodori tombol "Masuk"; pengunjung melihat header dan navigasi publik.
 */
export default async function PublicLayout({ children }: LayoutProps<"/">) {
  const user = await getSessionUser("member");
  const member = user?.status === "ACTIVE";

  return (
    <PhoneShell>
      {member ? <AppHeader /> : <SiteHeader />}
      <main className="flex w-full flex-1 flex-col px-margin pt-16 pb-28">
        {children}
      </main>
      {member ? <AppBottomNav /> : <BottomNav />}
    </PhoneShell>
  );
}
