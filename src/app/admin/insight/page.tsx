import type { Metadata } from "next";
import { InsightDashboard } from "@/components/admin/insight-dashboard";

export const metadata: Metadata = { title: "Insight Peserta" };

export default function InsightPage() {
  return <InsightDashboard />;
}
