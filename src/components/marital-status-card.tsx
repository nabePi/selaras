"use client";

import { useState } from "react";
import { MARITAL_STATUSES, type MaritalStatus } from "@/data/marital-status";
import { api } from "@/lib/api-client";
import { Icon } from "./icon";
import { useToast } from "./toast-provider";

/** Status pernikahan peserta; dipilih lalu disimpan ke server lewat tombol Simpan. */
export function MaritalStatusCard({ initial }: { initial: MaritalStatus | null }) {
  const { showToast } = useToast();
  const [saved, setSaved] = useState(initial);
  const [value, setValue] = useState(initial);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!value) return;
    setSaving(true);
    const result = await api<{ maritalStatus: MaritalStatus | null }>("/api/profile", "PATCH", { maritalStatus: value });
    setSaving(false);
    if (!result.ok) return showToast(result.error);
    setSaved(result.data.maritalStatus);
    setValue(result.data.maritalStatus);
    showToast("Status pernikahanmu sudah disimpan.", { tone: "success" });
  }

  return (
    <section className="flex flex-col gap-3 rounded-4xl bg-surface-container-low p-4 shadow-sm">
      <div className="flex items-center gap-1.5">
        <Icon name="favorite" size={18} className="text-primary" />
        <h2 id="marital-heading" className="t-title-sm text-on-surface">Status Pernikahan</h2>
      </div>

      <div role="radiogroup" aria-labelledby="marital-heading" className="grid grid-cols-2 gap-2">
        {MARITAL_STATUSES.map((s) => {
          const active = value === s.value;
          return (
            <button
              key={s.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setValue(s.value)}
              className={`t-body-md flex items-center justify-center gap-2 rounded-2xl px-3 py-3 shadow-xs transition-all active:scale-[0.98] ${
                active ? "bg-primary text-on-primary" : "bg-surface-container-lowest text-on-surface hover:bg-sage-tint"
              }`}
            >
              {active && <Icon name="check" size={16} />}
              {s.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="t-body-sm text-text-muted">Membantu tim pendamping menyesuaikan pendampingan.</p>
        <button
          type="button"
          onClick={save}
          disabled={!value || value === saved || saving}
          className="t-title-sm shrink-0 rounded-full bg-primary px-5 py-2 text-on-primary shadow-sm transition-all active:scale-[0.98] disabled:opacity-40"
        >
          {saving ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </section>
  );
}
