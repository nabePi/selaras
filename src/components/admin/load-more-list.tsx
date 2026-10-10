"use client";

import { Children, useState } from "react";
import { Icon } from "../icon";

/** Daftar `<li>` yang awalnya hanya menampilkan sebagian; tombol menambah `step` item lagi. */
export function LoadMoreList({ children, initial = 5, step = 5 }: { children: React.ReactNode; initial?: number; step?: number }) {
  const items = Children.toArray(children);
  const [shown, setShown] = useState(initial);
  const rest = items.length - shown;

  return (
    <>
      <ul className="space-y-2">{items.slice(0, shown)}</ul>
      {rest > 0 && (
        <button
          type="button"
          onClick={() => setShown((n) => n + step)}
          className="t-label-md flex w-full items-center justify-center gap-1.5 rounded-full bg-canvas-cream px-4 py-2.5 text-primary transition-colors hover:bg-surface-container-low"
        >
          Tampilkan lebih banyak ({rest})
          <Icon name="expand_more" size={18} />
        </button>
      )}
    </>
  );
}
