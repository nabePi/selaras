import type { Metadata } from "next";
import { Icon } from "@/components/icon";
import { MemberCourseList, type CourseCard } from "@/components/member-course-list";
import { requireMemberPage } from "@/lib/server/session";
import { todayWib } from "@/lib/server/time";
import { listMyCourses } from "@/server/member/courses";

export const metadata: Metadata = { title: "Kelas" };

export default async function KelasPage() {
  const user = await requireMemberPage();
  const courses = await listMyCourses(user.id);
  const today = todayWib();

  const cards: CourseCard[] = courses.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    posterUrl: c.posters[0]?.url ?? null,
    sessionCount: c.sessions.length,
    nextDate:
      c.sessions
        .map((s) => s.date)
        .filter((d) => d >= today)
        .sort()[0] ?? null,
    instructors: [...new Set(c.sessions.map((s) => s.instructorName).filter(Boolean))],
  }));

  return (
    <div className="mt-3 flex w-full flex-col gap-4">
      <div className="flex items-center gap-2">
        <Icon name="school" size={20} className="text-primary" />
        <h1 className="t-headline-sm text-on-surface">Kelasku</h1>
      </div>

      {cards.length === 0 ? (
        <div className="rounded-3xl bg-surface-container-low p-8 text-center shadow-sm">
          <Icon name="school" size={32} className="mx-auto text-text-muted" />
          <p className="t-title-md mt-2 text-on-surface">Belum ada kelas</p>
          <p className="t-body-sm text-text-muted">Kelas yang kamu ikuti akan muncul di sini setelah didaftarkan oleh tim Selaras.</p>
        </div>
      ) : (
        <MemberCourseList courses={cards} />
      )}
    </div>
  );
}
