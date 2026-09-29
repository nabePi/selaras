"use client";

import { useState } from "react";
import { Icon } from "./icon";

export function ShareButton({ title, text }: { title: string; text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Pengguna membatalkan dialog berbagi, atau izin clipboard ditolak.
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="t-title-sm inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-on-surface shadow-sm transition-all hover:bg-surface-bright"
    >
      <Icon name={copied ? "check" : "share"} size={16} />
      <span aria-live="polite">{copied ? "Tersalin" : "Bagikan"}</span>
    </button>
  );
}
