import type { Metadata } from "next";
import { InsightDashboard } from "@/components/admin/insight-dashboard";

export const metadata: Metadata = { title: "Agregat Insight Emosional" };

export default function InsightPage() {
  return <InsightDashboard />;
}
