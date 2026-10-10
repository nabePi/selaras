import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icon";
import { PosterCarousel } from "@/components/poster-carousel";
import { SessionLocation } from "@/components/session-location";
import { SessionJoinButton } from "@/components/session-join-button";
import { formatDateId } from "@/data/admin-prompts";
import { formatFileSize, formatTimeRange, hasOffline, hasOnline, meetingPlatform, sessionModeLabel } from "@/data/courses";
import { sessionEndsAt, sessionOpensAt, sessionStartsAt } from "@/lib/course-time";
import { requireMemberPage } from "@/lib/server/session";
import { todayWib } from "@/lib/server/time";
import { getMyCourse } from "@/server/member/courses";

export const metadata: Metadata = { title: "Detail Kelas" };

export default async function DetailKelasPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireMemberPage();
  const course = await getMyCourse(user.id, id);
  if (!course) notFound();
  const today = todayWib();
  // Hanya sesi mendatang terdekat yang terbuka; sisanya tertutup.
  const nextUid = course.sessions.filter((x) => x.date >= today).sort((x, y) => x.date.localeCompare(y.date))[0]?.uid;

  return (
    <div className="mt-3 flex w-full flex-col gap-5">
      <Link href="/kelas" className="t-label-md flex w-fit items-center gap-1 text-primary">
        <Icon name="arrow_back" size={16} />
        Semua kelas
      </Link>

      {course.posters.length > 0 && <PosterCarousel posters={course.posters} title={course.title} />}

      <header className="flex flex-col gap-1">
        <h1 className="t-headline-md text-on-surface">{course.title}</h1>
        {course.description && <p className="t-body-md whitespace-pre-line text-text-muted">{course.description}</p>}
      </header>

      <ol className="flex flex-col gap-3">
        {course.sessions.map((s, i) => {
          const past = s.date < today;
          const isNext = s.uid === nextUid;
          const platform = s.meetingUrl ? meetingPlatform(s.meetingUrl) : null;
          return (
            <li key={s.uid}>
              <details open={isNext} className="group rounded-3xl bg-surface-container-low shadow-sm">
                <summary className="flex cursor-pointer list-none items-center gap-3 p-4 [&::-webkit-details-marker]:hidden">
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="t-label-sm font-semibold tracking-wide text-primary uppercase">
                      Sesi {i + 1} · {formatDateId(s.date)}
                      {s.time && ` · ${formatTimeRange(s.time, s.endTime)}`}
                      {` · ${sessionModeLabel(s.mode)}`}
                    </span>
                    <h2 className="t-title-md text-on-surface">{s.title}</h2>
                    {isNext && <span className="t-label-sm text-primary">Sesi terdekat</span>}
                    {past && <span className="t-label-sm text-text-muted">Sudah berlangsung</span>}
                  </div>
                  <Icon name="expand_more" size={24} className="shrink-0 text-text-muted transition-transform group-open:rotate-180" />
                </summary>

                <div className="flex flex-col gap-3 px-4 pb-4">
              {(s.instructorName || s.instructorPhoto) && (
                <div className="flex items-center gap-3">
                  {s.instructorPhoto?.url && (
                    <Image
                      src={s.instructorPhoto.url}
                      alt={s.instructorName}
                      width={96}
                      height={120}
                      unoptimized
                      className="aspect-[4/5] w-14 shrink-0 rounded-xl object-cover"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="t-title-sm text-on-surface">{s.instructorName}</p>
                    {s.instructorBio && <p className="t-body-sm text-text-muted">{s.instructorBio}</p>}
                  </div>
                </div>
              )}

              {hasOffline(s.mode) && s.locationName && <SessionLocation name={s.locationName} mapsUrl={s.mapsUrl} />}

              {hasOnline(s.mode) && s.meetingUrl && platform && (
                <SessionJoinButton url={s.meetingUrl} platform={platform} opensAt={sessionOpensAt(s.date, s.time)} startsAt={sessionStartsAt(s.date, s.time)} endsAt={sessionEndsAt(s.date, s.time, s.endTime)} />
              )}

              {s.recordings.map(
                (r) =>
                  r.url && (
                    <div key={r.key} className="flex flex-col gap-1.5">
                      <span className="t-label-md text-on-surface">{r.title || "Rekaman sesi"}</span>
                      <video controls preload="metadata" src={r.url} className="w-full rounded-2xl bg-black" />
                    </div>
                  ),
              )}

              {s.documents.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="t-label-md text-on-surface">Dokumen</span>
                  <ul className="flex flex-col gap-1.5">
                    {s.documents.map((d) => (
                      <li key={d.key}>
                        <a
                          href={d.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-2xl bg-surface px-3 py-2.5 text-on-surface transition-colors hover:bg-surface-container"
                        >
                          <Icon name="description" size={18} className="shrink-0 text-primary" />
                          <span className="t-body-sm min-w-0 flex-1 truncate">{d.name}</span>
                          {d.size > 0 && <span className="t-label-sm shrink-0 text-text-muted">{formatFileSize(d.size)}</span>}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
                </div>
              </details>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
