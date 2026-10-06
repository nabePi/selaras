import Link from "next/link";
import type { JournalPrompt } from "@/data/journal-prompts";
import { Icon } from "./icon";

/**
 * Kartu "tulis jurnal hari ini" di Home dan Journal. Tiga keadaan: sudah menulis, ada prompt
 * hari ini, atau tidak ada prompt (jurnal bebas).
 */
export function JournalTodayCard({
  prompt,
  written,
  todayLabel,
}: {
  prompt: JournalPrompt | null;
  written: boolean;
  todayLabel: string;
}) {
  const heading = written
    ? "Alhamdulillah, jurnal hari ini sudah tersimpan"
    : prompt
      ? prompt.title
      : "Tulis apa pun yang kamu rasakan hari ini";
  const note = written
    ? "Kamu masih bisa memperbarui catatanmu sebelum hari berganti."
    : prompt
      ? prompt.subtitle || prompt.questions[0]?.label
      : "Belum ada prompt untuk hari ini, jadi kamu bebas menulis jurnal tanpa prompt.";

  return (
    <div className="flex flex-col gap-4 rounded-4xl bg-surface-container-low p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {!written && <span className="size-2.5 animate-pulse rounded-full bg-accent-coral" />}
          {written && <Icon name="check_circle" size={16} filled className="text-primary" />}
          <span className="t-label-sm font-semibold tracking-wider text-secondary uppercase">
            {prompt ? "Prompt Hari Ini" : "Jurnal Bebas"} • {todayLabel}
          </span>
        </div>
        <span className="t-label-sm rounded-full bg-surface-container-highest px-2.5 py-0.5 font-medium text-tertiary">
          ~3 Menit
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="t-headline-sm leading-snug text-on-surface">{heading}</h2>
        {note && <p className="t-body-sm text-text-muted">{note}</p>}
      </div>
      <Link
        href="/journal/tulis"
        className="t-title-sm flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 tracking-wide text-on-primary shadow-md transition-all hover:bg-primary-container active:scale-[0.99]"
      >
        <span>{written ? "Perbarui Jurnal" : "Tulis Jurnal Sekarang"}</span>
        <Icon name="arrow_forward" size={18} />
      </Link>
    </div>
  );
}
