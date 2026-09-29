import type { Metadata } from "next";
import { PhoneShell } from "@/components/phone-shell";

// Halaman member bersifat pribadi, jangan diindeks mesin pencari.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <PhoneShell>{children}</PhoneShell>
  );
}
