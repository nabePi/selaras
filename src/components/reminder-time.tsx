"use client";

import { REMINDER_TIMES } from "@/data/member";
import { setStoredValue, useStoredValue } from "@/lib/stored-value";
import { Icon } from "./icon";

const STORAGE_KEY = "selaras:reminder-time";

const DEFAULT_TIME = "21:00";

export function ReminderTime() {
  const stored = useStoredValue(STORAGE_KEY);
  const time = stored && REMINDER_TIMES.includes(stored) ? stored : DEFAULT_TIME;

  function next() {
    const i = (REMINDER_TIMES.indexOf(time) + 1) % REMINDER_TIMES.length;
    setStoredValue(STORAGE_KEY, REMINDER_TIMES[i]);
  }

  return (
    <button
      type="button"
      onClick={next}
      aria-label={`Waktu pengingat ${time}. Ketuk untuk mengubah`}
      className="t-title-sm flex items-center gap-1 rounded-full bg-surface-bright px-3 py-1 text-on-surface shadow-xs transition-colors hover:bg-sage-tint"
    >
      <span>{time}</span>
      <Icon name="edit" size={14} />
    </button>
  );
}
