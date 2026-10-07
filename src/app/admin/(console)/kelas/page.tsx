import type { Metadata } from "next";
import { CourseList } from "@/components/admin/course-list";
import { requireAdminPage } from "@/lib/server/session";
import { listCourses } from "@/server/admin/courses";

export const metadata: Metadata = { title: "Kelola Kelas" };

export default async function KelasPage() {
  await requireAdminPage();
  return <CourseList courses={await listCourses()} />;
}
