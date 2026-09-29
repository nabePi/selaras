"use client";

import { Icon } from "./icon";
import { useToast } from "./toast-provider";

const BUTTON =
  "flex size-8 items-center justify-center rounded-full bg-surface-bright/80 text-on-surface shadow-sm backdrop-blur-md transition-transform active:scale-95";

export function WisdomActions({ shareText }: { shareText: string }) {
  const { showToast } = useToast();

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title: "Nasihat Hari Ini · Selaras Life", text: shareText });
        return;
      }
      await navigator.clipboard.writeText(shareText);
      showToast("Kartu Nasihat disalin");
    } catch {
      // Dialog berbagi dibatalkan atau izin clipboard ditolak.
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        aria-label="Dengarkan nasihat"
        className={BUTTON}
        onClick={() => showToast("Pemutar audio hadis akan hadir pada fase berikutnya ✨")}
      >
        <Icon name="volume_up" size={17} />
      </button>
      <button type="button" aria-label="Bagikan nasihat" className={BUTTON} onClick={share}>
        <Icon name="share" size={17} />
      </button>
    </div>
  );
}
