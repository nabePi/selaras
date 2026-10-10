"use client";

import { Icon } from "./icon";

/** Membuka dialog cetak peramban; pilih "Simpan sebagai PDF" untuk mengunduhnya. Tidak ikut tercetak. */
export function PrintButton({ label = "Save PDF" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="t-label-md ml-auto flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-on-primary shadow-md transition-all hover:bg-primary-container active:scale-[0.97] print:hidden"
    >
      <Icon name="download" size={18} />
      <span>{label}</span>
    </button>
  );
}
