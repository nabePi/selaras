"use client";

import { useState } from "react";
import { api } from "@/lib/api-client";
import { Icon } from "../icon";
import { useToast } from "../toast-provider";

/** Suka artikel; berlaku juga untuk pengunjung yang belum masuk (dikenali lewat cookie anonim). */
export function LikeButton({ slug, initialCount, initialLiked }: { slug: string; initialCount: number; initialLiked: boolean }) {
  const { showToast } = useToast();
  const [state, setState] = useState({ count: initialCount, liked: initialLiked });
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (busy) return;
    const before = state;
    setBusy(true);
    setState({ count: before.count + (before.liked ? -1 : 1), liked: !before.liked });
    const res = await api<{ count: number; liked: boolean }>(`/api/blog/${slug}/like`, "POST");
    setBusy(false);
    if (res.ok) setState(res.data);
    else {
      setState(before);
      showToast(res.error);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      aria-pressed={state.liked}
      className={`t-title-sm inline-flex items-center gap-1.5 rounded-full px-4 py-2 shadow-sm transition-all active:scale-95 ${
        state.liked ? "bg-error-container text-error" : "bg-surface text-on-surface hover:bg-surface-bright"
      }`}
    >
      <Icon name="favorite" size={18} filled={state.liked} />
      <span className="tabular-nums">{state.count}</span>
      <span className="sr-only">{state.liked ? "Batal suka" : "Suka"}</span>
    </button>
  );
}
