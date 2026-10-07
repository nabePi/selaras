import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CourseForm } from "@/components/admin/course-form";
import { requireAdminPage } from "@/lib/server/session";
import { getCourse } from "@/server/admin/courses";

type Params = Promise<{ id: string }>;

export const metadata: Metadata = { title: "Edit Kelas" };

export default async function EditKelasPage({ params }: { params: Params }) {
  const { id } = await params;
  await requireAdminPage();
  const course = await getCourse(id);
  if (!course) notFound();
  return <CourseForm key={course.id} initial={course} />;
}
