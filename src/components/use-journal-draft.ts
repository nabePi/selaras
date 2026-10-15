"use client";

import { useEffect, useRef, useState } from "react";
import { readJournalDraft, type JournalDraft } from "@/lib/journal-draft";

type Status = "loading" | "ready" | "saved" | "restored" | "error";

/** Write in the input handler so even immediate navigation keeps the latest keystroke. */
export function useJournalDraft(key: string, initial: JournalDraft) {
  const [draft, setDraft] = useState(initial);
  const [status, setStatus] = useState<Status>("loading");
  const current = useRef(initial);

  useEffect(() => {
    try {
      const restored = readJournalDraft(window.localStorage, key);
      if (restored) {
        current.current = restored;
        // Hydrate browser-only storage after SSR, before enabling the form.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDraft(restored);
      }
      setStatus(restored ? "restored" : "ready");
    } catch {
      setStatus("error");
    }
  }, [key]);

  function update(change: Partial<JournalDraft>) {
    const next = { ...current.current, ...change };
    current.current = next;
    setDraft(next);
    try {
      window.localStorage.setItem(key, JSON.stringify(next));
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  function clear() {
    try {
      window.localStorage.removeItem(key);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }

  return { draft, update, clear, status };
}
