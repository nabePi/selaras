import type { Metadata } from "next";
import { DashboardOverview } from "@/components/admin/dashboard-overview";
import { requireAdminPage } from "@/lib/server/session";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminHomePage() {
  await requireAdminPage();
  return <DashboardOverview />;
}
