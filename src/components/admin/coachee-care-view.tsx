"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CoacheeCare } from "@/data/coachee-care";
import { api } from "@/lib/api-client";
import { Icon } from "../icon";
import { BlogContent } from "../blog/blog-content";
import { useToast } from "../toast-provider";
import { CareFiles } from "./care-files";
import { btnPrimary } from "./page-header";

/** Daftar coachee care satu peserta: tanggal di kiri, detail yang dipilih di kanan. */
export function CoacheeCareView({ user, items }: { user: { id: string; name: string }; items: CoacheeCare[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [selectedId, setSelectedId] = useState<string | undefined>(items[0]?.id);
  const [deleting, setDeleting] = useState(false);
  const selected = items.find((i) => i.id === selectedId) ?? items[0];

  async function remove(item: CoacheeCare) {
    if (!window.confirm(`Hapus coachee care “${item.title}”? Lampirannya ikut terhapus.`)) return;
    setDeleting(true);
    const result = await api<{ deleted: true }>(`/api/admin/coachee-care/${item.id}`, "DELETE");
    setDeleting(false);
    if (!result.ok) return showToast(result.error);
    showToast("Coachee care dihapus.", { tone: "success" });
    setSelectedId(undefined);
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-[1720px] space-y-8 px-4 py-8 sm:px-8 lg:p-10">
      <header className="space-y-2 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="t-label-sm inline-flex items-center gap-1.5 rounded-full bg-sage-tint px-3 py-1 tracking-wide text-primary">
              <span className="size-1.5 rounded-full bg-primary" />
              Coachee Care
            </span>
            <span className="t-body-sm text-text-muted" aria-hidden="true">
              •
            </span>
            <span className="t-body-sm text-text-muted">
              {user.id} · {items.length} masukan
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/admin/users/${user.id}/jurnal`}
              className="t-title-sm flex items-center gap-2 rounded-full bg-canvas-cream px-4 py-2.5 text-on-surface shadow-sm transition-colors hover:bg-surface-container-low"
            >
              <Icon name="arrow_back" size={18} />
              Kembali ke Jurnal
            </Link>
            <Link href={`/admin/users/${user.id}/coachee-care/baru`} className={btnPrimary}>
              <Icon name="add" size={18} />
              Beri Coachee Care
            </Link>
          </div>
        </div>
        <h1 className="t-headline-lg tracking-tight text-on-surface">{user.name}</h1>
        <p className="t-body-md max-w-3xl leading-relaxed text-text-muted">
          Masukan dan pendampingan dari coach untuk peserta ini, berupa pesan dan lampiran berkas.
        </p>
      </header>

      {items.length === 0 || !selected ? (
        <p className="t-body-md rounded-3xl bg-canvas-ivory px-6 py-12 text-center text-text-muted shadow-sm">
          Belum ada coachee care untuk peserta ini.
        </p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr] lg:items-start">
          <nav aria-label="Daftar coachee care" className="rounded-3xl bg-canvas-ivory p-3 shadow-sm lg:sticky lg:top-6 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
            <ul className="space-y-1">
              {items.map((i) => {
                const active = i.id === selected.id;
                return (
                  <li key={i.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(i.id)}
                      aria-current={active ? "true" : undefined}
                      className={`flex w-full flex-col items-start gap-0.5 rounded-2xl px-4 py-3 text-left transition-colors ${
                        active ? "bg-sage-tint text-primary" : "text-on-surface hover:bg-canvas-cream"
                      }`}
                    >
                      <span className="t-title-sm line-clamp-2">{i.title}</span>
                      <span className="t-label-sm flex items-center gap-1 text-text-muted">
                        <Icon name="event" size={14} />
                        {i.dateLabel}
                        {i.reaction ? (
                          <span className="ml-1" title={`Dibaca, bereaksi ${i.reaction.emoji}`}>
                            {i.reaction.emoji}
                          </span>
                        ) : (
                          <span className="ml-1 text-text-muted">· Belum dibaca</span>
                        )}
                        {i.files.length > 0 && (
                          <>
                            <Icon name="attach_file" size={14} className="ml-1" />
                            {i.files.length}
                          </>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <article key={selected.id} className="space-y-6 rounded-3xl bg-canvas-ivory p-6 shadow-sm sm:p-8">
            <header className="flex items-start justify-between gap-3 border-b border-surface-container pb-5">
              <div className="space-y-1">
                <p className="t-label-md text-text-muted">
                  {selected.dateLabel} · {selected.timeLabel} · oleh {selected.authorName}
                </p>
                <h2 className="t-headline-sm text-on-surface">{selected.title}</h2>
              </div>
              <button
                type="button"
                disabled={deleting}
                onClick={() => void remove(selected)}
                aria-label={`Hapus ${selected.title}`}
                className="rounded-full p-2 text-text-muted transition-colors hover:bg-error-container hover:text-error disabled:opacity-60"
              >
                <Icon name="delete" size={20} />
              </button>
            </header>
            <p
              className={`t-label-md inline-flex items-center gap-2 rounded-full px-3 py-1.5 ${
                selected.reaction ? "bg-sage-tint text-primary" : "bg-secondary-container text-secondary"
              }`}
            >
              {selected.reaction
                ? `Sudah dibaca · bereaksi ${selected.reaction.emoji} pada ${selected.reaction.dateLabel}`
                : "Belum dibaca peserta"}
            </p>
            <BlogContent doc={selected.message} />
            <CareFiles files={selected.files} />
          </article>
        </div>
      )}
    </div>
  );
}
