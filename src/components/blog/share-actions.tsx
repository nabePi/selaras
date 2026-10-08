"use client";

import { useState } from "react";
import { Icon } from "../icon";

const pill =
  "t-title-sm inline-flex items-center gap-1.5 rounded-full bg-surface px-4 py-2 text-on-surface shadow-sm transition-all hover:bg-surface-bright active:scale-95";

/** Bagikan artikel: dialog bagikan bawaan perangkat bila ada, selain itu WhatsApp dan salin tautan. */
export function ShareActions({ title, path }: { title: string; path: string }) {
  const [copied, setCopied] = useState(false);
  const url = () => new URL(path, window.location.origin).href;

  async function share() {
    try {
      if (navigator.share) return await navigator.share({ title, url: url() });
      await navigator.clipboard.writeText(url());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Dialog dibatalkan atau izin clipboard ditolak.
    }
  }

  return (
    <>
      <button type="button" onClick={() => void share()} className={pill}>
        <Icon name={copied ? "check" : "share"} size={18} />
        <span aria-live="polite">{copied ? "Tersalin" : "Bagikan"}</span>
      </button>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          window.open(`https://wa.me/?text=${encodeURIComponent(`${title}\n${url()}`)}`, "_blank", "noopener,noreferrer");
        }}
        className={pill}
      >
        <Icon name="chat" size={18} />
        WhatsApp
      </a>
    </>
  );
}
