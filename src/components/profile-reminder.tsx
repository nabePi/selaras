"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "./icon";

/** Pengingat melengkapi profil di Home. Bisa ditutup, tetapi muncul lagi di kunjungan berikutnya sampai profil lengkap. */
export function ProfileReminder() {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-3xl bg-secondary-container p-4 shadow-sm"
    >
      <Icon
        name="person"
        size={20}
        filled
        className="mt-0.5 shrink-0 text-secondary"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="t-title-sm text-on-secondary-container">
          Lengkapi profilmu
        </p>
        <p className="t-body-sm text-on-secondary-container/80">
          Tambahkan foto, potensi &amp; keahlian, serta kegiatan sehari-harimu
          agar tim pendamping lebih mengenalmu.
        </p>
        <Link
          href="/profil"
          className="t-label-md mt-1 inline-flex items-center gap-1 self-start font-semibold text-secondary underline-offset-2 hover:underline"
        >
          Lengkapi sekarang
          <Icon name="arrow_forward" size={14} />
        </Link>
      </div>
      <button
        type="button"
        aria-label="Tutup pengingat"
        onClick={() => setOpen(false)}
        className="flex size-8 shrink-0 items-center justify-center rounded-full text-on-secondary-container/70 transition-colors hover:bg-on-secondary-container/10"
      >
        <Icon name="close" size={18} />
      </button>
    </div>
  );
}
