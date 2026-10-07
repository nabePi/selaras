import type { Metadata } from "next";
import { CourseForm } from "@/components/admin/course-form";
import { requireAdminPage } from "@/lib/server/session";

export const metadata: Metadata = { title: "Buat Kelas" };

export default async function KelasBaruPage() {
  await requireAdminPage();
  return <CourseForm />;
}
