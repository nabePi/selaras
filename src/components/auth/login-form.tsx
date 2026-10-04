"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { signIn } from "@/lib/auth";
import { Icon } from "../icon";
import { useToast } from "../toast-provider";
import { Field } from "./field";
import { ForgotPasswordDialog } from "./forgot-password-dialog";
import { PasswordField } from "./password-field";

type Errors = { identifier?: string; password?: string; form?: string };

export function LoginForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    if (!identifier.trim()) next.identifier = "Isi email atau nomor WhatsApp Anda.";
    if (!password) next.password = "Isi kata sandi Anda.";
    setErrors(next);
    if (next.identifier || next.password) {
      formRef.current?.querySelector<HTMLInputElement>(next.identifier ? "#identifierInput" : "#passwordInput")?.focus();
      return;
    }

    setSubmitting(true);
    const result = await signIn({ identifier: identifier.trim(), password, remember });
    if (!result.ok) {
      setSubmitting(false);
      setErrors({ form: result.error });
      return;
    }
    showToast("Alhamdulillah, selamat kembali ke ruang refleksi Anda.", { tone: "success" });
    router.push("/home");
  }

  return (
    <>
      <form ref={formRef} noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field
          id="identifierInput"
          name="identifier"
          label="Email atau WhatsApp"
          hint={<span className="t-body-sm font-normal text-text-muted">Terdaftar di program</span>}
          icon="mark_email_read"
          type="text"
          autoComplete="username"
          placeholder="nama@email.com atau 0812xxxxxxx"
          value={identifier}
          onChange={(e) => {
            setIdentifier(e.target.value);
            setErrors((x) => ({ ...x, identifier: undefined, form: undefined }));
          }}
          error={errors.identifier}
        />

        <div className="flex flex-col gap-1.5">
          <PasswordField
            id="passwordInput"
            name="password"
            label="Kata Sandi"
            hint={
              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                className="t-label-md font-medium text-primary transition-colors hover:text-on-primary-fixed-variant"
              >
                Lupa Kata Sandi?
              </button>
            }
            autoComplete="current-password"
            placeholder="Masukkan kata sandi akun"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors((x) => ({ ...x, password: undefined, form: undefined }));
            }}
            error={errors.password}
          />
        </div>

        <label className="flex cursor-pointer items-center gap-2.5 py-0.5 select-none">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="size-4 cursor-pointer rounded-md accent-primary"
          />
          <span className="t-body-sm text-on-surface-variant">
            Simpan sesi hening saya di perangkat ini
          </span>
        </label>

        {errors.form && (
          <p role="alert" className="t-body-sm rounded-xl bg-error-container px-3 py-2 text-error">
            {errors.form}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="t-title-md mt-1 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-on-primary shadow-md transition-all duration-200 hover:opacity-95 active:scale-[0.98] disabled:opacity-80"
        >
          <span>{submitting ? "Menghubungkan..." : "Masuk ke Akun"}</span>
          {!submitting && <Icon name="arrow_forward" size={19} />}
        </button>
      </form>

      <ForgotPasswordDialog
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        defaultTarget={identifier.trim()}
      />
    </>
  );
}
