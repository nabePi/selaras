"use client";

import { useState } from "react";
import { Icon } from "./icon";

export function LikeButton({ initial }: { initial: number }) {
  const [liked, setLiked] = useState(false);

  return (
    <button
      type="button"
      aria-pressed={liked}
      aria-label={liked ? "Batalkan suka" : "Sukai cerita ini"}
      onClick={() => setLiked((l) => !l)}
      className={`t-body-sm flex items-center gap-1 transition-colors hover:text-accent-coral ${
        liked ? "text-accent-coral" : "text-text-muted"
      }`}
    >
      <Icon name="favorite" size={18} filled={liked} />
      <span>{initial + (liked ? 1 : 0)}</span>
    </button>
  );
}
