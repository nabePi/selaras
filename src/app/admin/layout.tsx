import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";

// Konsol internal: jangan diindeks mesin pencari.
export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin Selaras Life" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <AdminShell>{children}</AdminShell>;
}
