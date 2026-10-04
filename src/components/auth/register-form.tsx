"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { registerAccount } from "@/lib/auth";
import { isEmail, normalizeWhatsApp, passwordStrength } from "@/lib/validation";
import { Icon } from "../icon";
import { useToast } from "../toast-provider";
import { Field } from "./field";
import { PasswordField } from "./password-field";

type FieldName = "fullName" | "whatsapp" | "email" | "password" | "confirmPassword" | "agree";
type Errors = Partial<Record<FieldName | "form", string>>;

const FIELD_IDS: Record<FieldName, string> = {
  fullName: "full-name",
  whatsapp: "wa-number",
  email: "email",
  password: "password",
  confirmPassword: "confirm-password",
  agree: "privacy-agree",
};

// Warna tiap segmen meter kekuatan, dari kiri ke kanan.
const METER_COLORS = ["bg-accent-coral", "bg-accent-sunray", "bg-sage-medium", "bg-primary"];
const METER_LABEL_TONES = [
  "text-text-muted",
  "font-medium text-accent-coral",
  "font-medium text-tertiary",
  "font-medium text-primary",
  "font-semibold text-primary",
];

export function RegisterForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const strength = passwordStrength(password);

  function clear(name: FieldName) {
    setErrors((x) => ({ ...x, [name]: undefined, form: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const wa = normalizeWhatsApp(whatsapp);
    const next: Errors = {};
    if (fullName.trim().length < 2) next.fullName = "Isi nama lengkap Anda.";
    if (!wa) next.whatsapp = "Nomor WhatsApp tidak valid. Contoh: 812 3456 7890.";
    if (!isEmail(email)) next.email = "Alamat email tidak valid.";
    if (password.length < 8) next.password = "Kata sandi minimal 8 karakter.";
    if (!confirmPassword) next.confirmPassword = "Ulangi kata sandi Anda.";
    else if (confirmPassword !== password) next.confirmPassword = "Kata sandi tidak sama.";
    if (!agree) next.agree = "Setujui Ketentuan Layanan & Kebijakan Privasi untuk melanjutkan.";
    setErrors(next);

    const firstInvalid = (Object.keys(FIELD_IDS) as FieldName[]).find((k) => next[k]);
    if (firstInvalid || !wa) {
      if (firstInvalid) formRef.current?.querySelector<HTMLElement>(`#${FIELD_IDS[firstInvalid]}`)?.focus();
      return;
    }

    setSubmitting(true);
    const result = await registerAccount({
      fullName: fullName.trim(),
      whatsapp: wa,
      email: email.trim(),
      password,
    });
    if (!result.ok) {
      setSubmitting(false);
      setErrors({ form: result.error });
      return;
    }
    showToast("Akun berhasil dibuat. Selamat datang di Selaras Life!", { tone: "success" });
    router.push("/home");
  }

  return (
    <form ref={formRef} noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field
        id="full-name"
        name="fullName"
        label="Nama Lengkap"
        icon="person"
        type="text"
        autoComplete="name"
        placeholder="Contoh: Larasati Dewi"
        value={fullName}
        onChange={(e) => {
          setFullName(e.target.value);
          clear("fullName");
        }}
        error={errors.fullName}
      />

      <Field
        id="wa-number"
        name="whatsapp"
        label="Nomor WhatsApp Aktif"
        prefix={<span className="t-title-sm font-semibold text-on-surface">+62</span>}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        placeholder="812 3456 7890"
        value={whatsapp}
        onChange={(e) => {
          setWhatsapp(e.target.value);
          clear("whatsapp");
        }}
        error={errors.whatsapp}
      />

      <Field
        id="email"
        name="email"
        label="Alamat Email"
        icon="mail"
        type="email"
        autoComplete="email"
        placeholder="nama@email.com"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          clear("email");
        }}
        error={errors.email}
      />

      <div className="flex flex-col gap-1.5">
        <PasswordField
          id="password"
          name="password"
          label="Kata Sandi"
          autoComplete="new-password"
          placeholder="Minimal 8 karakter aman"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            clear("password");
          }}
          error={errors.password}
        />
        <div className="mt-1 flex items-center gap-1.5 px-1" aria-live="polite">
          {METER_COLORS.map((color, i) => (
            <div
              key={color}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                strength.level > i ? color : "bg-border-subtle"
              }`}
            />
          ))}
          <span
            className={`t-label-sm ml-1 min-w-[50px] text-right font-normal ${METER_LABEL_TONES[strength.level]}`}
          >
            <span className="sr-only">Kekuatan kata sandi: </span>
            {strength.label}
          </span>
        </div>
      </div>

      <PasswordField
        id="confirm-password"
        name="confirmPassword"
        label="Ulangi Kata Sandi"
        autoComplete="new-password"
        placeholder="Masukkan ulang kata sandi Anda"
        value={confirmPassword}
        onChange={(e) => {
          setConfirmPassword(e.target.value);
          clear("confirmPassword");
        }}
        error={errors.confirmPassword}
      />

      <div className="mt-2 flex flex-col gap-1.5">
        <div className="flex items-start gap-3 rounded-2xl bg-surface-container-low p-3.5 shadow-sm">
          <input
            id="privacy-agree"
            type="checkbox"
            checked={agree}
            onChange={(e) => {
              setAgree(e.target.checked);
              clear("agree");
            }}
            aria-invalid={errors.agree ? true : undefined}
            aria-describedby={errors.agree ? "privacy-agree-error" : undefined}
            className="mt-1 size-4 cursor-pointer rounded accent-primary"
          />
          <label
            htmlFor="privacy-agree"
            className="t-body-sm cursor-pointer leading-relaxed text-on-surface-variant select-none"
          >
            Saya menyetujui <span className="font-medium text-primary">Ketentuan Layanan</span> &amp;{" "}
            <span className="font-medium text-primary">Kebijakan Privasi</span> Selaras Life. Data
            refleksi Anda dienkripsi dan terjaga kerahasiaannya.
          </label>
        </div>
        {errors.agree && (
          <p id="privacy-agree-error" role="alert" className="t-body-sm flex items-center gap-1 pl-1 text-error">
            <Icon name="error" size={14} />
            {errors.agree}
          </p>
        )}
      </div>

      {errors.form && (
        <p role="alert" className="t-body-sm rounded-xl bg-error-container px-3 py-2 text-error">
          {errors.form}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="t-title-md mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-semibold text-on-primary shadow-[0_8px_20px_-4px_rgba(78,97,72,0.35)] transition-all hover:bg-primary-container active:scale-[0.98] disabled:opacity-80"
      >
        <span>{submitting ? "Membuat akun..." : "Daftar Akun Baru"}</span>
        {!submitting && <Icon name="east" size={20} />}
      </button>
    </form>
  );
}
