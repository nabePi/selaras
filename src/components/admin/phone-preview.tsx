import Image from "next/image";
import type { ResponseType } from "@/data/admin-prompts";
import { Icon } from "../icon";

type Props = {
  prompt: string;
  responseType: ResponseType;
  dayLabel: string;
  sessionTitle: string;
  voice: { name: string } | null;
};

const MOODS = ["😔", "😕", "😐", "🙂", "😊"];

export function PhonePreview({ prompt, responseType, dayLabel, sessionTitle, voice }: Props) {
  return (
    <div className="relative w-full max-w-[390px] rounded-[42px] bg-on-surface p-3.5 shadow-2xl transition-transform duration-300 hover:scale-[1.008]">
      <div className="relative flex h-[740px] flex-col overflow-hidden rounded-[34px] bg-surface text-on-surface shadow-inner select-none">
        <div aria-hidden="true" className="absolute top-2.5 left-1/2 z-30 flex h-5 w-28 -translate-x-1/2 items-center justify-between rounded-full bg-on-surface px-3">
          <span className="size-2 rounded-full bg-surface-container-highest/30" />
          <span className="size-2.5 rounded-full bg-surface-container-highest/40" />
        </div>
        <div aria-hidden="true" className="z-20 flex h-10 items-center justify-between px-6 pt-2 text-[11px] font-semibold">
          <span>05:12</span>
          <span className="flex items-center gap-1.5 text-text-muted">
            <Icon name="signal_cellular_alt" size={13} />
            <Icon name="wifi" size={13} />
            <Icon name="battery_full" size={13} />
          </span>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 pt-2 pb-24">
          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="t-headline-sm text-[17px] leading-tight">Assalamu&apos;alaikum, Laras</p>
              <p className="text-[11px] text-text-muted">{sessionTitle}</p>
            </div>
            <Image src="/images/profile-larasati.jpg" alt="" width={36} height={36} className="size-9 rounded-full object-cover" />
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-canvas-cream p-3">
            <span className="flex items-center gap-2">
              <Icon name="favorite" size={18} className="text-accent-coral" />
              <span className="t-label-sm">{dayLabel}</span>
            </span>
            <span className="t-label-sm text-primary">Tersedia Subuh Ini</span>
          </div>

          <div className="relative space-y-3.5 overflow-hidden rounded-3xl bg-canvas-ivory p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-secondary-container px-2.5 py-1 text-[11px] font-semibold text-on-secondary-container">Refleksi Pasutri</span>
              <Icon name="spa" size={16} className="text-sage-medium" />
            </div>
            <h3 className="t-headline-md text-[18px] leading-snug">
              {prompt.trim() || "Sentuh untuk menuliskan pertanyaan yang memantik kelembutan hati..."}
            </h3>
            <div className="space-y-2 pt-1">
              <AnswerMock type={responseType} />
              <div className="flex items-center justify-between rounded-xl bg-canvas-cream p-2.5">
                <span className="flex items-center gap-2">
                  <Icon name="visibility" size={16} className="text-primary" />
                  <span className="text-[11px]">Bagikan ke Coach Selaras</span>
                </span>
                <span className="flex h-[18px] w-8 items-center justify-end rounded-full bg-primary p-0.5">
                  <span className="size-3.5 rounded-full bg-on-primary" />
                </span>
              </div>
            </div>
            <div className="t-label-md rounded-full bg-primary py-2.5 text-center font-medium text-on-primary shadow-sm">Simpan Renungan Harian</div>
          </div>

          {voice && (
            <div className="flex items-center gap-2 rounded-3xl bg-sage-tint/60 p-3 shadow-sm">
              <span className="flex size-7 items-center justify-center rounded-full bg-primary text-on-primary">
                <Icon name="play_arrow" size={16} />
              </span>
              <span className="text-[11px] text-text-muted">Voice note · Coach Afifah</span>
            </div>
          )}
        </div>

        <div aria-hidden="true" className="absolute right-4 bottom-3 left-4 z-30 flex h-14 items-center justify-around rounded-full bg-canvas-cream/90 px-2 shadow-lg backdrop-blur-md">
          <span className="flex flex-col items-center text-primary">
            <span className="flex size-7 items-center justify-center rounded-full bg-sage-tint"><Icon name="home" size={18} /></span>
            <span className="text-[9px] font-semibold">Home</span>
          </span>
          <span className="flex flex-col items-center text-text-muted"><Icon name="auto_stories" size={20} /><span className="text-[9px]">Jurnal</span></span>
          <span className="flex flex-col items-center text-text-muted"><Icon name="person" size={20} /><span className="text-[9px]">Profil</span></span>
        </div>
      </div>
    </div>
  );
}

function AnswerMock({ type }: { type: ResponseType }) {
  if (type === "scale") {
    return (
      <div className="grid grid-cols-5 gap-1.5 rounded-2xl bg-canvas-cream p-3">
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="flex h-7 items-center justify-center rounded-full bg-surface text-[11px] font-semibold text-text-muted">{i + 1}</span>
        ))}
      </div>
    );
  }
  if (type === "choice") {
    return (
      <div className="space-y-1.5 rounded-2xl bg-canvas-cream p-3">
        {["Pilihan pertama", "Pilihan kedua", "Pilihan ketiga"].map((o) => (
          <span key={o} className="flex items-center gap-2 rounded-xl bg-surface px-3 py-2 text-[12px] text-text-muted">
            <span className="size-3 rounded-full border border-outline-variant" />
            {o}
          </span>
        ))}
      </div>
    );
  }
  if (type === "mood") {
    return (
      <div className="flex justify-between rounded-2xl bg-canvas-cream p-3 text-2xl">
        {MOODS.map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    );
  }
  return (
    <div className="flex min-h-[72px] items-start rounded-2xl bg-canvas-cream p-3 text-[12px] text-text-muted">
      Sentuh untuk menuliskan jawaban renunganmu bersama pasangan...
    </div>
  );
}
