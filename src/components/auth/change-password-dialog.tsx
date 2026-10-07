"use client";

import { useState } from "react";
import { changeTemporaryPassword } from "@/lib/auth";
import { Dialog, DialogActions } from "../dialog";
import { Icon } from "../icon";
import { PasswordField } from "./password-field";

type Errors = { newPassword?: string; confirm?: string; form?: string };

/** Wajib diisi peserta yang masuk dengan password sementara dari admin; setelahnya mereka masuk ulang. */
export function ChangePasswordDialog({
  open,
  onClose,
  identifier,
  currentPassword,
  onChanged,
}: {
  open: boolean;
  onClose: () => void;
  identifier: string;
  currentPassword: string;
  onChanged: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} eyebrow="Keamanan Akun" title="Buat Password Baru" size="sm">
      <ChangeForm identifier={identifier} currentPassword={currentPassword} onClose={onClose} onChanged={onChanged} />
    </Dialog>
  );
}

function ChangeForm({
  identifier,
  currentPassword,
  onClose,
  onChanged,
}: {
  identifier: string;
  currentPassword: string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    if (newPassword.length < 8) next.newPassword = "Password baru minimal 8 karakter.";
    else if (newPassword === currentPassword) next.newPassword = "Password baru harus berbeda dari password sementara.";
    if (confirm !== newPassword) next.confirm = "Konfirmasi password tidak sama.";
    setErrors(next);
    if (next.newPassword || next.confirm) return;

    setSaving(true);
    const result = await changeTemporaryPassword({ identifier, currentPassword, newPassword });
    setSaving(false);
    if (!result.ok) return setErrors({ newPassword: result.fields?.newPassword, form: result.error });
    onChanged();
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <div className="flex items-start gap-2.5 rounded-2xl bg-sage-tint p-3.5">
        <Icon name="info" size={18} className="mt-0.5 shrink-0 text-primary" />
        <p className="t-body-sm leading-snug text-primary">
          Kamu masuk dengan password sementara. Buat password baru, lalu masuk kembali dengan password tersebut.
        </p>
      </div>
      <PasswordField
        id="newPasswordInput"
        name="newPassword"
        label="Password Baru"
        autoComplete="new-password"
        placeholder="Minimal 8 karakter"
        value={newPassword}
        onChange={(e) => {
          setNewPassword(e.target.value);
          setErrors((x) => ({ ...x, newPassword: undefined, form: undefined }));
        }}
        error={errors.newPassword}
        data-autofocus
      />
      <PasswordField
        id="confirmPasswordInput"
        name="confirmPassword"
        label="Ulangi Password Baru"
        autoComplete="new-password"
        value={confirm}
        onChange={(e) => {
          setConfirm(e.target.value);
          setErrors((x) => ({ ...x, confirm: undefined, form: undefined }));
        }}
        error={errors.confirm}
      />
      {errors.form && errors.form !== errors.newPassword && (
        <p role="alert" className="t-body-sm rounded-xl bg-error-container px-3 py-2 text-error">{errors.form}</p>
      )}
      <DialogActions onCancel={onClose} submitLabel="Simpan Password" submitting={saving} />
    </form>
  );
}
