"use client";

import { useState } from "react";
import { addCouple } from "@/lib/admin-actions";
import { normalizeWhatsApp } from "@/lib/validation";
import { Dialog, DialogActions, FieldLabel, fieldClass } from "../dialog";
import { Icon } from "../icon";

export type NewCoupleInput = {
  husband: string;
  wife: string;
  whatsapp: string;
  cohort: "Cohort 04" | "Cohort 05";
  activateNow: boolean;
};

type Errors = Partial<Record<"husband" | "wife" | "whatsapp" | "form", string>>;

export function AddCoupleDialog({
  open,
  onClose,
  onAdded,
}: {
  open: boolean;
  onClose: () => void;
  onAdded: (input: NewCoupleInput) => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} eyebrow="Formulir Admin" title="Tambah Pasutri Baru">
      <AddCoupleForm onClose={onClose} onAdded={onAdded} />
    </Dialog>
  );
}

function AddCoupleForm({ onClose, onAdded }: { onClose: () => void; onAdded: (i: NewCoupleInput) => void }) {
  const [husband, setHusband] = useState("");
  const [wife, setWife] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [cohort, setCohort] = useState<NewCoupleInput["cohort"]>("Cohort 04");
  const [activateNow, setActivateNow] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    if (husband.trim().length < 2) next.husband = "Isi nama suami.";
    if (wife.trim().length < 2) next.wife = "Isi nama istri.";
    if (!normalizeWhatsApp(whatsapp)) next.whatsapp = "Nomor WhatsApp tidak valid (contoh: 0812 3456 7890).";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    const input: NewCoupleInput = { husband: husband.trim(), wife: wife.trim(), whatsapp: whatsapp.trim(), cohort, activateNow };
    const result = await addCouple(input);
    setSaving(false);
    if (!result.ok) {
      setErrors({ form: result.error });
      return;
    }
    onAdded(input);
    onClose();
  }

  const clear = (k: keyof Errors) => setErrors((x) => ({ ...x, [k]: undefined, form: undefined }));

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <FieldLabel htmlFor="add-husband">Nama Suami</FieldLabel>
          <input id="add-husband" value={husband} onChange={(e) => { setHusband(e.target.value); clear("husband"); }} placeholder="cth: Ahmad Fauzi" className={fieldClass} aria-invalid={!!errors.husband} />
          {errors.husband && <p role="alert" className="t-body-sm text-error">{errors.husband}</p>}
        </div>
        <div className="space-y-1">
          <FieldLabel htmlFor="add-wife">Nama Istri</FieldLabel>
          <input id="add-wife" value={wife} onChange={(e) => { setWife(e.target.value); clear("wife"); }} placeholder="cth: Siti Rahma" className={fieldClass} aria-invalid={!!errors.wife} />
          {errors.wife && <p role="alert" className="t-body-sm text-error">{errors.wife}</p>}
        </div>
      </div>

      <div className="space-y-1">
        <FieldLabel htmlFor="add-wa">Nomor WhatsApp Utama (Suami/Istri)</FieldLabel>
        <input id="add-wa" type="tel" inputMode="tel" value={whatsapp} onChange={(e) => { setWhatsapp(e.target.value); clear("whatsapp"); }} placeholder="08xxxxxxxxxx" className={fieldClass} aria-invalid={!!errors.whatsapp} />
        {errors.whatsapp && <p role="alert" className="t-body-sm text-error">{errors.whatsapp}</p>}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <FieldLabel htmlFor="add-cohort">Cohort Target</FieldLabel>
          <select id="add-cohort" value={cohort} onChange={(e) => setCohort(e.target.value as NewCoupleInput["cohort"])} className={`${fieldClass} cursor-pointer`}>
            <option value="Cohort 04">Cohort 04 (Aktif)</option>
            <option value="Cohort 05">Cohort 05 (Mendatang)</option>
          </select>
        </div>
        <div className="space-y-1">
          <FieldLabel htmlFor="add-status">Status Awal</FieldLabel>
          <select id="add-status" value={activateNow ? "now" : "manual"} onChange={(e) => setActivateNow(e.target.value === "now")} className={`${fieldClass} cursor-pointer`}>
            <option value="now">Langsung Aktifkan (Buka H-1)</option>
            <option value="manual">Menunggu Aktivasi Manual</option>
          </select>
        </div>
      </div>

      <div className="flex items-start gap-2.5 rounded-2xl bg-sage-tint p-3.5">
        <Icon name="info" size={18} className="mt-0.5 shrink-0 text-primary" />
        <p className="t-body-sm leading-snug text-primary">
          Pasutri akan otomatis menerima pesan selamat datang WhatsApp beserta tautan login PWA Selaras Life
          sesuai jadwal cohort.
        </p>
      </div>

      {errors.form && <p role="alert" className="t-body-sm rounded-xl bg-error-container px-3 py-2 text-error">{errors.form}</p>}

      <DialogActions onCancel={onClose} submitLabel="Simpan & Proses Akses" submitting={saving} />
    </form>
  );
}
