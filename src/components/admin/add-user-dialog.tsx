"use client";

import { useState } from "react";
import { createUser, type CreatedUser } from "@/lib/admin-actions";
import { normalizeWhatsApp } from "@/lib/validation";
import { Dialog, DialogActions, FieldLabel, fieldClass } from "../dialog";
import { DefaultPasswordResult } from "./default-password-result";

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

  const clear = (k: keyof Errors) => setErrors((x) => ({ ...x, [k]: undefined, form: undefined }));

  if (created) {
    return (
      <DefaultPasswordResult
        intro={
          <>
            Akun <span className="font-semibold text-on-surface">{created.name}</span> sudah dibuat dan langsung aktif.
          </>
        }
        whatsapp={created.whatsapp}
        password={created.defaultPassword}
        onClose={onClose}
      />
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
