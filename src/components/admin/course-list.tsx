import Image from "next/image";
import Link from "next/link";
import { formatDateId } from "@/data/admin-prompts";
import { hasOffline, hasOnline, meetingPlatform, sessionModeLabel, type Course } from "@/data/courses";
import { Icon } from "../icon";
import { CourseParticipantsButton } from "./course-participants-button";
import { DeleteCourseButton } from "./delete-course-button";
import { PageHeader, btnPrimary } from "./page-header";

export function CourseList({ courses }: { courses: Course[] }) {
  return (
    <div className="mx-auto w-full max-w-[1720px] space-y-8 px-4 py-8 sm:px-8 lg:p-10">
      <PageHeader
        pill="Kelas"
        pulse={false}
        meta={`${courses.length} kelas`}
        title="Kelola Kelas"
        description="Buat kelas beserta sesinya: jadwal, tautan Zoom/Google Meet, pengajar, rekaman video, dan dokumen."
        actions={
          <Link href="/admin/kelas/baru" className={btnPrimary}>
            <Icon name="add" size={18} />
            <span>Buat Kelas</span>
          </Link>
        }
      />

      {courses.length === 0 ? (
        <div className="rounded-3xl bg-canvas-ivory p-10 text-center shadow-sm">
          <Icon name="school" size={36} className="mx-auto text-text-muted" />
          <p className="t-title-md mt-3 text-on-surface">Belum ada kelas</p>
          <p className="t-body-md text-text-muted">Klik “Buat Kelas” untuk menambahkan kelas pertama.</p>
        </div>
      ) : (
        <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((c) => (
            <li key={c.id} className="flex flex-col gap-4 rounded-3xl bg-canvas-ivory p-5 shadow-sm">
              <div className="flex gap-4">
                <div className="relative aspect-[3/4] w-28 shrink-0 overflow-hidden rounded-2xl bg-canvas-sand">
                  {c.posters[0]?.url ? (
                    <Image src={c.posters[0].url} alt={`Poster ${c.title}`} fill unoptimized sizes="112px" className="object-cover" />
                  ) : (
                    <span className="flex size-full items-center justify-center text-text-muted">
                      <Icon name="image" size={28} />
                    </span>
                  )}
                  {c.posters.length > 1 && (
                    <span className="t-label-sm absolute right-1.5 bottom-1.5 rounded-full bg-inverse-surface/80 px-2 py-0.5 text-inverse-on-surface">
                      +{c.posters.length - 1}
                    </span>
                  )}
                </div>
                <div className="min-w-0 space-y-1">
                  <h2 className="t-title-md text-on-surface">{c.title}</h2>
                  <p className="t-label-sm text-primary">{c.sessions.length} sesi</p>
                  {c.description && <p className="t-body-sm line-clamp-4 text-text-muted">{c.description}</p>}
                </div>
              </div>

              <ol className="space-y-2">
                {c.sessions.map((s, i) => (
                  <li key={s.uid} className="rounded-2xl bg-surface-container-low px-3 py-2.5">
                    <p className="t-body-sm font-semibold text-on-surface">
                      {i + 1}. {s.title}
                    </p>
                    <p className="t-label-sm text-text-muted">
                      {formatDateId(s.date)}
                      {s.time && ` · ${s.time} WIB`}
                      {` · ${sessionModeLabel(s.mode)}`}
                      {hasOnline(s.mode) && s.meetingUrl && ` · ${meetingPlatform(s.meetingUrl)}`}
                      {hasOffline(s.mode) && s.locationName && ` · ${s.locationName}`}
                      {s.instructorName && ` · ${s.instructorName}`}
                    </p>
                    <p className="t-label-sm mt-1 flex flex-wrap gap-x-3 text-text-muted">
                      <span className="inline-flex items-center gap-1">
                        <Icon name="movie" size={14} />
                        {s.recording ? "Rekaman ada" : "Belum ada rekaman"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Icon name="description" size={14} />
                        {s.documents.length} dokumen
                      </span>
                    </p>
                  </li>
                ))}
              </ol>

              <div className="mt-auto flex flex-wrap items-center justify-end gap-2">
                <CourseParticipantsButton course={c} />
                <Link
                  href={`/admin/kelas/${c.id}/edit`}
                  className="t-label-md flex items-center gap-1.5 rounded-full bg-canvas-cream px-4 py-2 text-on-surface shadow-sm transition-colors hover:bg-surface-container-low"
                >
                  <Icon name="edit" size={16} />
                  Edit
                </Link>
                <DeleteCourseButton course={c} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
