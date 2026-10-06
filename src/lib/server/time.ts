const TZ = "Asia/Jakarta";

/** Tanggal hari ini di WIB sebagai "YYYY-MM-DD". */
export function todayWib(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(now);
}

/** Jam di WIB, mis. "05.17 WIB" (format yang dipakai UI admin). */
export function timeWib(date: Date): string {
  const parts = new Intl.DateTimeFormat("id-ID", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return `${get("hour")}.${get("minute")} WIB`;
}

export const isoDate = (d: Date) => d.toISOString().slice(0, 10);

/** Tanggal (WIB) dari sebuah momen sebagai "YYYY-MM-DD". */
export const isoDateWib = (d: Date) => todayWib(d);

/** "2026-10-06" → "Selasa" */
export function weekdayId(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("id-ID", { weekday: "long", timeZone: "UTC" });
}

/** Menggeser tanggal ISO sebanyak `days` hari. */
export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** "2 jam lalu", "Kemarin", "3 hari lalu", atau tanggal untuk yang lebih lama. */
export function timeAgoId(date: Date, now = new Date()): string {
  const minutes = Math.floor((now.getTime() - date.getTime()) / 60_000);
  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const dayDiff = Math.round(
    (new Date(`${todayWib(now)}T00:00:00Z`).getTime() - new Date(`${todayWib(date)}T00:00:00Z`).getTime()) / 86_400_000,
  );
  if (dayDiff <= 1) return "Kemarin";
  if (dayDiff < 7) return `${dayDiff} hari lalu`;
  return new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" });
}
