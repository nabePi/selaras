"use client";

import { useState } from "react";
import { createUser, type CreatedUser } from "@/lib/admin-actions";
import { normalizeWhatsApp } from "@/lib/validation";
import { Dialog, DialogActions, FieldLabel, fieldClass } from "../dialog";
import { Icon } from "../icon";
import { useToast } from "../toast-provider";

type Errors = Partial<Record<"name" | "whatsapp" | "form", string>>;

const inputClass = `${fieldClass} border border-outline-variant focus-visible:border-sage-medium`;

export function AddUserDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} eyebrow="Formulir Admin" title="Tambah User" size="sm">
      <AddUserForm onClose={onClose} onCreated={onCreated} />
    </Dialog>
  );
}

function AddUserForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState<CreatedUser | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    if (name.trim().length < 2) next.name = "Isi nama lengkap.";
    if (!normalizeWhatsApp(whatsapp)) next.whatsapp = "Nomor WhatsApp tidak valid (contoh: 0812 3456 7890).";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    const result = await createUser({ name: name.trim(), whatsapp: whatsapp.trim() });
    setSaving(false);
    if (!result.ok) {
      setErrors({ whatsapp: result.fields?.whatsapp, name: result.fields?.name, form: result.error });
      return;
    }
    setCreated(result.data);
    onCreated();
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Password default disalin.", { tone: "success" });
    } catch {
      showToast("Tidak bisa menyalin otomatis. Salin manual dari kotak di atas.");
    }
  }

  const clear = (k: keyof Errors) => setErrors((x) => ({ ...x, [k]: undefined, form: undefined }));

  if (created) {
    return (
      <div className="space-y-4">
        <p className="t-body-md text-text-muted">
          Akun <span className="font-semibold text-on-surface">{created.name}</span> sudah dibuat dan langsung aktif.
          Sampaikan password default ini lewat WhatsApp ke {created.whatsapp}. Password ini hanya ditampilkan sekali.
        </p>
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-outline-variant bg-canvas-ivory px-4 py-3">
          <code className="t-title-md tracking-wider text-on-surface select-all">{created.defaultPassword}</code>
          <button
            type="button"
            onClick={() => void copy(created.defaultPassword)}
            className="t-label-md flex items-center gap-1.5 rounded-full bg-surface-container-low px-3 py-1.5 text-on-surface transition-colors hover:bg-surface-container"
          >
            <Icon name="content_copy" size={15} />
            Salin
          </button>
        </div>
        <div className="flex items-start gap-2.5 rounded-2xl bg-sage-tint p-3.5">
          <Icon name="info" size={18} className="mt-0.5 shrink-0 text-primary" />
          <p className="t-body-sm leading-snug text-primary">
            Saat masuk dengan nomor WhatsApp dan password ini, peserta diminta membuat password baru lalu masuk kembali.
          </p>
        </div>
        <div className="flex justify-end pt-2">
          <button type="button" onClick={onClose} className="t-title-sm rounded-full bg-primary px-6 py-2.5 text-on-primary shadow-md hover:bg-primary-container">
            Selesai
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="space-y-1">
        <FieldLabel htmlFor="add-user-name">Nama Lengkap</FieldLabel>
        <input
          id="add-user-name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            clear("name");
          }}
          placeholder="cth: Ahmad Fauzi"
          autoComplete="off"
          className={inputClass}
          aria-invalid={!!errors.name}
        />
        {errors.name && <p role="alert" className="t-body-sm text-error">{errors.name}</p>}
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor="add-user-wa">Nomor WhatsApp</FieldLabel>
        <input
          id="add-user-wa"
          type="tel"
          inputMode="tel"
          value={whatsapp}
          onChange={(e) => {
            setWhatsapp(e.target.value);
            clear("whatsapp");
          }}
          placeholder="08xxxxxxxxxx"
          autoComplete="off"
          className={inputClass}
          aria-invalid={!!errors.whatsapp}
        />
        {errors.whatsapp && <p role="alert" className="t-body-sm text-error">{errors.whatsapp}</p>}
      </div>
      <p className="t-body-sm text-text-muted">
        Password default dibuat otomatis dari 4 huruf pertama nama dan 4 digit terakhir nomor WhatsApp.
      </p>
      {errors.form && errors.form !== errors.whatsapp && errors.form !== errors.name && (
        <p role="alert" className="t-body-sm rounded-xl bg-error-container px-3 py-2 text-error">{errors.form}</p>
      )}
      <DialogActions onCancel={onClose} submitLabel="Buat Akun" submitting={saving} />
    </form>
  );
}
