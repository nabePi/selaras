"use client";

import Link from "next/link";
import { useState } from "react";
import type { MemberEntry } from "@/lib/journal-types";
import { EntryAttachments } from "../entry-attachments";
import { Icon } from "../icon";
import { btnPrimary } from "./page-header";

/**
 * Jurnal satu peserta untuk admin: daftar tanggal di kiri, detail tanggal terpilih di kanan.
 * Hanya entri yang dibagikan ke coach yang dikirim ke sini; entri privat cuma dihitung.
 */
export function UserJournalView({
  user,
  entries,
  privateCount,
}: {
  user: { id: string; name: string };
  entries: MemberEntry[];
  privateCount: number;
}) {
  const [selectedId, setSelectedId] = useState(entries[0]?.id);
  const selected = entries.find((e) => e.id === selectedId) ?? entries[0];

  return (
    <div className="mx-auto w-full max-w-[1720px] space-y-8 px-4 py-8 sm:px-8 lg:p-10">
      <header className="space-y-2 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="t-label-sm inline-flex items-center gap-1.5 rounded-full bg-sage-tint px-3 py-1 tracking-wide text-primary">
              <span className="size-1.5 rounded-full bg-primary" />
              Jurnal Peserta
            </span>
            <span className="t-body-sm text-text-muted" aria-hidden="true">
              •
            </span>
            <span className="t-body-sm text-text-muted">
              {user.id} · {entries.length} jurnal dibagikan
              {privateCount > 0 && ` · ${privateCount} privat tidak ditampilkan`}
            </span>
          </div>
          <Link
            href="/admin/users"
            className="t-title-sm flex items-center gap-2 rounded-full bg-canvas-cream px-4 py-2.5 text-on-surface shadow-sm transition-colors hover:bg-surface-container-low"
          >
            <Icon name="arrow_back" size={18} />
            Kembali ke Users
          </Link>
        </div>
        <h1 className="t-headline-lg tracking-tight text-on-surface">{user.name}</h1>
        <p className="t-body-md max-w-3xl leading-relaxed text-text-muted">
          Jurnal yang dibagikan peserta ke coach, baik dengan prompt maupun jurnal bebas. Jurnal privat tidak dapat dilihat admin.
        </p>
      </header>

      <section className="flex flex-col gap-4 rounded-3xl bg-canvas-ivory p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-sage-tint text-primary">
            <Icon name="volunteer_activism" size={22} />
          </span>
          <div>
            <h2 className="t-title-md text-on-surface">Masukan untuk {user.name}</h2>
            <p className="t-body-sm text-text-muted">Berikan pesan dan lampiran berkas sebagai pendampingan setelah membaca jurnal.</p>
          </div>
        </div>
        <Link href={`/admin/users/${user.id}/coachee-care`} className={`${btnPrimary} shrink-0 justify-center`}>
          <Icon name="favorite" size={18} />
          Coachee Care
        </Link>
      </section>

      {entries.length === 0 ? (
        <p className="t-body-md rounded-3xl bg-canvas-ivory px-6 py-12 text-center text-text-muted shadow-sm">
          Belum ada jurnal yang dibagikan ke coach.
        </p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr] lg:items-start">
          <nav aria-label="Tanggal jurnal" className="rounded-3xl bg-canvas-ivory p-3 shadow-sm lg:sticky lg:top-6 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
            <ul className="space-y-1">
              {entries.map((e) => {
                const active = e.id === selected?.id;
                return (
                  <li key={e.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(e.id)}
                      aria-current={active ? "true" : undefined}
                      className={`flex w-full flex-col items-start gap-0.5 rounded-2xl px-4 py-3 text-left transition-colors ${
                        active ? "bg-sage-tint text-primary" : "text-on-surface hover:bg-canvas-cream"
                      }`}
                    >
                      <span className="t-title-sm">
                        {e.dayLabel}, {e.dateLabel}
                      </span>
                      <span className="t-label-sm flex items-center gap-1 text-text-muted">
                        <Icon name={e.promptTitle ? "edit_note" : "edit"} size={14} />
                        <span className="truncate">{e.promptTitle ?? "Jurnal bebas"}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {selected && <EntryDetail key={selected.id} entry={selected} />}
        </div>
      )}
    </div>
  );
}

function EntryDetail({ entry: e }: { entry: MemberEntry }) {
  return (
    <article className="space-y-6 rounded-3xl bg-canvas-ivory p-6 shadow-sm sm:p-8">
      <header className="space-y-2 border-b border-surface-container pb-5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="t-label-md text-text-muted">
            {e.dayLabel}, {e.dateLabel}
          </p>
          <span className="t-label-sm rounded-full bg-sage-tint px-2.5 py-1 text-primary">
            {e.promptTitle ? "Dengan prompt" : "Tanpa prompt"}
          </span>
          {e.feeling && (
            <span className="t-label-sm rounded-full bg-canvas-cream px-2.5 py-1 text-on-surface">
              {e.feeling.emoji} {e.feeling.label}
            </span>
          )}
        </div>
        <h2 className="t-headline-sm text-on-surface">{e.promptTitle ?? "Jurnal bebas"}</h2>
        {e.promptSubtitle && <p className="t-body-md text-text-muted">{e.promptSubtitle}</p>}
      </header>

      {e.answers.length > 0 && (
        <dl className="space-y-4">
          {e.answers.map((a, i) => (
            <div key={`${i}-${a.label}`} className="rounded-2xl bg-canvas-cream p-4">
              <dt className="t-label-md text-text-muted">{a.label}</dt>
              <dd className="t-body-md mt-1 whitespace-pre-line text-on-surface">{a.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {e.note && (
        <section className="rounded-2xl bg-canvas-cream p-4">
          <h3 className="t-label-md text-text-muted">Catatan Rasa</h3>
          <p className="t-body-md mt-1 whitespace-pre-line text-on-surface">{e.note}</p>
        </section>
      )}

      <EntryAttachments attachments={e.attachments} />
    </article>
  );
}
