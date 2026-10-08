"use client";

import { useEffect, useState } from "react";
import { Icon } from "./icon";

const base = "t-title-sm flex w-full items-center justify-center gap-2 rounded-full px-5 py-3";
const disabledClass = `${base} cursor-not-allowed bg-surface-container-high text-text-muted`;

/**
 * Tombol gabung Zoom/Google Meet. Hanya aktif antara `opensAt` dan `endsAt` (epoch ms); status
 * diperiksa ulang tiap 30 detik agar halaman yang dibiarkan terbuka ikut berubah.
 */
export function SessionJoinButton({
  url,
  platform,
  opensAt,
  startsAt,
  endsAt,
}: {
  url: string;
  platform: string;
  opensAt: number;
  /** Jam mulai; null bila tidak ada jam (hitung mundur tidak ditampilkan). */
  startsAt: number | null;
  endsAt: number;
}) {
  // Null sampai terpasang di peramban: Date.now() di server dan klien berbeda, sehingga memakainya
  // sebagai nilai awal membuat hidrasi gagal.
  const [now, setNow] = useState<number | null>(null);
  const counting = now !== null && startsAt !== null && now < startsAt;

  // Tiap detik selama hitung mundur berjalan; selebihnya cukup tiap 30 detik.
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, counting ? 1_000 : 30_000);
    return () => clearInterval(id);
  }, [counting]);

  if (now === null)
    return (
      <button type="button" disabled aria-disabled="true" className={disabledClass}>
        <Icon name="schedule" size={18} />
        Memeriksa jadwal…
      </button>
    );
  if (now > endsAt)
    return (
      <button type="button" disabled aria-disabled="true" className={disabledClass}>
        <Icon name="videocam_off" size={18} />
        Sesi telah berakhir
      </button>
    );
  const countdown = counting && (
    <p className="t-label-md text-center text-text-muted">
      Dimulai dalam <span className="font-semibold text-primary tabular-nums">{formatCountdown(startsAt - now)}</span>
    </p>
  );
  if (now < opensAt)
    return (
      <div className="flex flex-col gap-1.5">
        <button type="button" disabled aria-disabled="true" className={disabledClass}>
          <Icon name="schedule" size={18} />
          Dibuka 30 menit sebelum acara
        </button>
        {countdown}
      </div>
    );
  return (
    <div className="flex flex-col gap-1.5">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`${base} bg-primary text-on-primary shadow-md transition-colors hover:bg-primary-container`}
      >
        <Icon name="videocam" size={18} />
        Gabung lewat {platform}
      </a>
      {countdown}
    </div>
  );
}

/** "2 hari 3 jam" bila lebih dari sehari, selain itu "HH:MM:SS". */
function formatCountdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  if (days > 0) return `${days} hari ${h} jam`;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;
}
