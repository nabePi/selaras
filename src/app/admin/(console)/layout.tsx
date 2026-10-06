import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminPage } from "@/lib/server/session";

// Konsol internal: jangan diindeks mesin pencari.
export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin Selaras Life" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const admin = await requireAdminPage();
  return <AdminShell adminName={admin.name}>{children}</AdminShell>;
}
