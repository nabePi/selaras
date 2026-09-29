import { useSyncExternalStore } from "react";

/**
 * Nilai string di localStorage sebagai external store.
 * Di server (dan render hydration pertama) nilainya null, lalu sinkron di client.
 */
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

export function useStoredValue(key: string): string | null {
  return useSyncExternalStore(
    subscribe,
    () => {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    () => null,
  );
}

/** Mengembalikan false bila penyimpanan diblokir peramban. */
export function setStoredValue(key: string, value: string | null): boolean {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    return false;
  }
  listeners.forEach((l) => l());
  return true;
}
