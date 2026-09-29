import type { Metadata } from "next";
import { CurriculumManager } from "@/components/admin/curriculum-manager";

export const metadata: Metadata = { title: "Manajemen Kelas & Sesi" };

export default function KelasPage() {
  return <CurriculumManager />;
}
