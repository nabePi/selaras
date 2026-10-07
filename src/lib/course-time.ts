/** Lama sesi dihitung sejak jam mulai, karena durasi belum dicatat admin. */
const SESSION_DURATION_MS = 3 * 60 * 60 * 1000;

/** Waktu sesi berakhir (epoch ms): jam mulai (WIB) + durasi, atau akhir hari bila jam kosong. */
export function sessionEndsAt(date: string, time: string) {
  return time
    ? new Date(`${date}T${time}:00+07:00`).getTime() + SESSION_DURATION_MS
    : new Date(`${date}T23:59:59+07:00`).getTime();
}

/** Tombol gabung dibuka 30 menit sebelum jam mulai. */
const JOIN_OPENS_BEFORE_MS = 30 * 60 * 1000;

/**
 * Waktu tombol gabung mulai aktif (epoch ms): 30 menit sebelum jam mulai (WIB). Tanpa jam mulai,
 * aktif sejak awal hari sesi.
 */
export function sessionOpensAt(date: string, time: string) {
  return time
    ? new Date(`${date}T${time}:00+07:00`).getTime() - JOIN_OPENS_BEFORE_MS
    : new Date(`${date}T00:00:00+07:00`).getTime();
}

/** Jam mulai sesi (epoch ms, WIB); null bila admin tidak mengisi jam mulai. */
export function sessionStartsAt(date: string, time: string) {
  return time ? new Date(`${date}T${time}:00+07:00`).getTime() : null;
}
