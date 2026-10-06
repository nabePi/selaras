import type { Metadata } from "next";
import { InsightDashboard } from "@/components/admin/insight-dashboard";
import { requireAdminPage } from "@/lib/server/session";

export const metadata: Metadata = { title: "Insight Peserta" };

export default async function InsightPage() {
  await requireAdminPage();
  return <InsightDashboard />;
}
