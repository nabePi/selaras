import type { Metadata } from "next";
import { PhoneShell } from "@/components/phone-shell";
import { requireMemberPage } from "@/lib/server/session";

// Halaman member bersifat pribadi, jangan diindeks mesin pencari.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AppLayout({ children }: LayoutProps<"/">) {
  // Seluruh halaman member (home, journal, profil, dst.) hanya untuk peserta aktif yang sudah masuk.
  await requireMemberPage();
  return (
    <PhoneShell>{children}</PhoneShell>
  );
}
