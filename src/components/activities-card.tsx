"use client";

import { useState } from "react";
import { api } from "@/lib/api-client";
import { Icon } from "./icon";
import { useToast } from "./toast-provider";

const MAX_LENGTH = 500;

/** Kegiatan sehari-hari / kesibukan peserta (teks bebas), disimpan ke server lewat tombol Simpan. */
export function ActivitiesCard({ initial }: { initial: string }) {
  const { showToast } = useToast();
  const [saved, setSaved] = useState(initial);
  const [text, setText] = useState(initial);
  const [saving, setSaving] = useState(false);

  const dirty = text.trim() !== saved;

  async function save() {
    setSaving(true);
    const result = await api<{ activities: string }>("/api/profile", "PATCH", { activities: text });
    setSaving(false);
    if (!result.ok) return showToast(result.error);
    setSaved(result.data.activities);
    setText(result.data.activities);
    showToast("Kegiatan sehari-harimu sudah disimpan.", { tone: "success" });
  }

  return (
    <section className="flex flex-col gap-3 rounded-4xl bg-surface-container-low p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon name="today" size={18} className="text-primary" />
          <h2 className="t-title-sm text-on-surface">Kegiatan Sehari-hari</h2>
        </div>
        <span className="t-label-sm text-text-muted">
          {text.length}/{MAX_LENGTH}
        </span>
      </div>

      <label htmlFor="profile-activities" className="sr-only">
        Kegiatan sehari-hari atau kesibukan
      </label>
      <textarea
        id="profile-activities"
        rows={4}
        maxLength={MAX_LENGTH}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ceritakan kesibukanmu, mis. mengurus rumah, bekerja kantoran, kuliah, usaha online…"
        className="t-body-md w-full resize-none rounded-2xl bg-surface-container-lowest p-3.5 text-on-surface shadow-xs outline-none placeholder:text-text-muted focus-visible:ring-2 focus-visible:ring-primary"
      />
      <div className="flex items-center justify-between gap-3">
        <p className="t-body-sm text-text-muted">Membantu tim pendamping memahami rutinitasmu.</p>
        <button
          type="button"
          onClick={save}
          disabled={!dirty || saving}
          className="t-title-sm shrink-0 rounded-full bg-primary px-5 py-2 text-on-primary shadow-sm transition-all active:scale-[0.98] disabled:opacity-40"
        >
          {saving ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </section>
  );
}
