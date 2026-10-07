import Image from "next/image";
import Link from "next/link";
import { formatDateId } from "@/data/admin-prompts";
import { meetingPlatform } from "@/data/courses";
import { sessionEndsAt, sessionOpensAt, sessionStartsAt } from "@/lib/course-time";
import { Icon } from "./icon";
import { SessionJoinButton } from "./session-join-button";

export type HomeCourse = {
  id: string;
  title: string;
  posterUrl: string | null;
  sessionNumber: number;
  sessionCount: number;
  /** Sesi mendatang terdekat dari kelas ini. */
  session: { title: string; date: string; time: string; instructorName: string; meetingUrl: string };
};

/** Info kelas yang sedang diikuti peserta: sesi terdekat tiap kelas beserta tombol gabung. */
export function HomeCourseInfo({ courses, today }: { courses: HomeCourse[]; today: string }) {
  return (
    <section aria-label="Info kelas" className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Icon name="school" size={18} className="text-primary" />
          <h2 className="t-title-md text-on-surface">Kelas yang Kamu Ikuti</h2>
        </div>
        <Link href="/kelas" className="t-label-md text-primary">
          Lihat semua
        </Link>
      </div>

      <ul className="flex flex-col gap-3">
        {courses.map((c) => {
          const s = c.session;
          const platform = s.meetingUrl ? meetingPlatform(s.meetingUrl) : null;
          return (
            <li key={c.id} className="flex flex-col gap-3 rounded-3xl bg-surface-container-low p-3 shadow-sm">
              <Link href={`/kelas/${c.id}`} className="flex gap-3">
                <div className="relative aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-xl bg-canvas-sand">
                  {c.posterUrl ? (
                    <Image src={c.posterUrl} alt={`Poster ${c.title}`} fill unoptimized sizes="80px" className="object-cover" />
                  ) : (
                    <span className="flex size-full items-center justify-center text-text-muted">
                      <Icon name="image" size={22} />
                    </span>
                  )}
                </div>
                <div className="flex min-w-0 flex-col justify-center gap-0.5">
                  <span className="t-label-sm font-semibold tracking-wide text-primary uppercase">{c.title}</span>
                  <p className="t-title-sm text-on-surface">
                    Sesi {c.sessionNumber}/{c.sessionCount}: {s.title}
                  </p>
                  <p className="t-body-sm text-text-muted">
                    {s.date === today ? "Hari ini" : formatDateId(s.date)}
                    {s.time && ` · ${s.time} WIB`}
                  </p>
                  {s.instructorName && <p className="t-body-sm text-text-muted">{s.instructorName}</p>}
                </div>
              </Link>
              {s.meetingUrl && platform && (
                <SessionJoinButton url={s.meetingUrl} platform={platform} opensAt={sessionOpensAt(s.date, s.time)} startsAt={sessionStartsAt(s.date, s.time)} endsAt={sessionEndsAt(s.date, s.time)} />
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
