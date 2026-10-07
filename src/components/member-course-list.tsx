"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { formatDateId } from "@/data/admin-prompts";
import { FilterPills } from "./filter-pills";
import { Icon } from "./icon";

export type CourseCard = {
  id: string;
  title: string;
  description: string;
  posterUrl: string | null;
  sessionCount: number;
  /** Tanggal sesi mendatang terdekat (ISO), null bila semua sesi sudah lewat. */
  nextDate: string | null;
  /** Nama pengajar dari semua sesi, untuk pencarian. */
  instructors: string[];
};

type Filter = "semua" | "mendatang" | "selesai";
type Sort = "terbaru" | "terdekat" | "judul";

const FILTERS = [
  { value: "semua", label: "Semua" },
  { value: "mendatang", label: "Akan datang" },
  { value: "selesai", label: "Selesai" },
] as const;

const SORTS: { value: Sort; label: string }[] = [
  { value: "terbaru", label: "Terbaru" },
  { value: "terdekat", label: "Sesi terdekat" },
  { value: "judul", label: "Judul A–Z" },
];

/** Daftar kelas peserta dengan pencarian, filter status, dan pengurutan (di sisi klien). */
export function MemberCourseList({ courses }: { courses: CourseCard[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("semua");
  const [sort, setSort] = useState<Sort>("terbaru");

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = courses.filter((c) => {
      if (filter === "mendatang" && !c.nextDate) return false;
      if (filter === "selesai" && c.nextDate) return false;
      return !q || [c.title, c.description, ...c.instructors].some((t) => t.toLowerCase().includes(q));
    });
    // `courses` sudah terurut terbaru dari server; sort() di JS stabil.
    if (sort === "judul") list.sort((a, b) => a.title.localeCompare(b.title, "id"));
    if (sort === "terdekat")
      list.sort((a, b) => (a.nextDate ?? "9999-12-31").localeCompare(b.nextDate ?? "9999-12-31"));
    return list;
  }, [courses, query, filter, sort]);

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex items-center gap-2">
        <label className="relative flex-1">
          <span className="sr-only">Cari kelas</span>
          <Icon name="search" size={18} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari kelas atau pengajar…"
            className="t-body-md h-11 w-full rounded-full border border-outline-variant bg-surface-container-lowest pr-4 pl-10 text-on-surface outline-none placeholder:text-text-muted/60 focus-visible:border-sage-medium focus-visible:ring-2 focus-visible:ring-sage-medium"
          />
        </label>
        <label className="relative shrink-0">
          <span className="sr-only">Urutkan kelas</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="t-label-md h-11 cursor-pointer appearance-none rounded-full border border-outline-variant bg-surface-container-lowest pr-9 pl-4 text-on-surface outline-none focus-visible:border-sage-medium focus-visible:ring-2 focus-visible:ring-sage-medium"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <Icon name="expand_more" size={20} className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-text-muted" />
        </label>
      </div>

      <FilterPills label="Filter kelas" options={[...FILTERS]} value={filter} onChange={setFilter} />

      {shown.length === 0 ? (
        <div className="rounded-3xl bg-surface-container-low p-8 text-center shadow-sm">
          <Icon name="search_off" size={32} className="mx-auto text-text-muted" />
          <p className="t-title-md mt-2 text-on-surface">Kelas tidak ditemukan</p>
          <p className="t-body-sm text-text-muted">Coba kata kunci lain atau ubah filter.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {shown.map((c) => (
            <li key={c.id}>
              <Link
                href={`/kelas/${c.id}`}
                className="flex w-full gap-4 rounded-2xl bg-surface-container-low p-3 shadow-sm transition-colors hover:bg-surface-container"
              >
                <div className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden rounded-xl bg-canvas-sand">
                  {c.posterUrl ? (
                    <Image src={c.posterUrl} alt={`Poster ${c.title}`} fill unoptimized sizes="96px" className="object-cover" />
                  ) : (
                    <span className="flex size-full items-center justify-center text-text-muted">
                      <Icon name="image" size={24} />
                    </span>
                  )}
                </div>
                <div className="flex min-w-0 flex-col justify-center gap-1">
                  <h2 className="t-title-md text-on-surface">{c.title}</h2>
                  <span className="t-label-md text-primary">{c.sessionCount} sesi</span>
                  <p className="t-body-sm text-text-muted">
                    {c.nextDate ? `Sesi berikutnya: ${formatDateId(c.nextDate)}` : "Semua sesi telah berlangsung"}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
