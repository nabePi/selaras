import { addDays, todayWib } from "./server/time";

/** Three WIB calendar days, anchored to the latest activation date. */
export function giftPeriod(enabledAt: Date, now = new Date()) {
  const anchor = todayWib(enabledAt);
  const today = todayWib(now);
  const days = Math.floor((Date.parse(today) - Date.parse(anchor)) / 86_400_000);
  const index = Math.max(0, Math.floor(days / 3));
  const start = addDays(anchor, index * 3);
  const end = addDays(start, 3);
  return {
    start: new Date(`${start}T00:00:00Z`),
    expiresAt: new Date(`${end}T00:00:00+07:00`),
  };
}
