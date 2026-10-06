"use client";

import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import type { MemberEntry } from "@/lib/journal-types";
import { Icon } from "./icon";

type Props = {
  entry: MemberEntry | null;
  onClose: () => void;
};

/** Popup pratinjau jurnal saat tanggal "sudah diisi" di kalender diklik. */
export function JournalEntryDialog({ entry, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (entry && !dialog.open) dialog.showModal();
    if (!entry && dialog.open) dialog.close();
  }, [entry]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="m-0 size-full max-h-none max-w-none items-end justify-center bg-transparent p-4 backdrop:bg-on-surface/40 backdrop:backdrop-blur-sm open:flex sm:items-center"
    >
      {entry && <DialogCard entry={entry} titleId={titleId} onClose={onClose} />}
    </dialog>
  );
}

function DialogCard({
  entry,
  titleId,
  onClose,
}: {
  entry: MemberEntry;
  titleId: string;
  onClose: () => void;
}) {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3 rounded-3xl bg-surface p-5 shadow-2xl">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="t-label-sm rounded-full bg-sage-tint px-2.5 py-0.5 font-semibold text-primary">
            {entry.dayLabel}
          </span>
          <span className="t-body-sm text-text-muted">{entry.dateLabel}</span>
        </div>
        <button
          type="button"
          aria-label="Tutup"
          onClick={onClose}
          className="rounded-full p-1 text-text-muted hover:text-on-surface"
        >
          <Icon name="close" size={20} />
        </button>
      </div>

      <div className="flex flex-col gap-1">
        <span className="t-label-sm font-semibold tracking-wider text-primary uppercase">
          Prompt Harian
        </span>
        <h2 id={titleId} className="t-quote leading-snug text-on-surface">
          {entry.promptTitle ? `“${entry.promptTitle}”` : "Jurnal Bebas"}
        </h2>
      </div>

      <p className="t-body-md line-clamp-4 text-on-surface-variant">{entry.content}</p>

      <div className="flex items-center justify-between gap-2 pt-1">
        {entry.shared ? (
          <span className="t-label-sm flex items-center gap-1 rounded-full bg-accent-mint/30 px-2 py-0.5 text-primary">
            <Icon name="verified_user" size={13} />
            Dibagikan ke Coach
          </span>
        ) : (
          <span className="t-label-sm flex items-center gap-1 rounded-full bg-surface-container px-2 py-0.5 text-tertiary">
            <Icon name="lock" size={13} />
            Privat
          </span>
        )}
        <Link
          href={`/journal/${entry.id}`}
          className="t-title-sm flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-on-primary shadow-sm transition-all hover:opacity-90 active:scale-95"
        >
          <span>Lihat Detail</span>
          <Icon name="arrow_forward" size={16} />
        </Link>
      </div>
    </div>
  );
}
