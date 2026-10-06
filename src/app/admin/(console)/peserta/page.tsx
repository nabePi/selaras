import type { Metadata } from "next";
import { CouplesManager } from "@/components/admin/couples-manager";

export const metadata: Metadata = { title: "Aktivasi & Data Peserta" };

export default function PesertaPage() {
  return <CouplesManager />;
}
