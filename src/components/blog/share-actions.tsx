"use client";

import { useState } from "react";
import { Icon } from "../icon";

/**
 * Bagikan artikel lewat menu bagikan bawaan perangkat (Android/iOS: pilih aplikasi atau salin tautan).
 * Peramban tanpa Web Share (mis. desktop) menyalin tautan ke clipboard.
 */
export function ShareActions({ title, path }: { title: string; path: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = new URL(path, window.location.origin).href;
    try {
      if (navigator.share) return await navigator.share({ title, text: title, url });
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Dialog dibatalkan atau izin clipboard ditolak.
    }
  }

  return (
    <button
      type="button"
      onClick={() => void share()}
      className="t-title-sm inline-flex items-center gap-1.5 rounded-full bg-surface px-4 py-2 text-on-surface shadow-sm transition-all hover:bg-surface-bright active:scale-95"
    >
      <Icon name={copied ? "check" : "share"} size={18} />
      <span aria-live="polite">{copied ? "Tautan tersalin" : "Bagikan"}</span>
    </button>
  );
}
