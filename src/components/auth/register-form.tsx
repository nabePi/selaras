"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { registerAccount, type RegisterInput } from "@/lib/auth";
import { isEmail, normalizeWhatsApp, passwordStrength } from "@/lib/validation";
import { ComingSoonButton } from "../coming-soon-button";
import { Icon } from "../icon";
import { useToast } from "../toast-provider";
import { Field } from "./field";
import { GoogleIcon } from "./google-icon";
import { PasswordField } from "./password-field";

type Stage = RegisterInput["stage"];
type FieldName = "fullName" | "whatsapp" | "email" | "password" | "agree";
type Errors = Partial<Record<FieldName | "form", string>>;

const STAGES: { value: Stage; label: string; icon: string }[] = [
  { value: "young", label: "Pasangan Muda", icon: "favorite" },
  { value: "prep", label: "Persiapan Menikah", icon: "psychology_alt" },
];

const FIELD_IDS: Record<FieldName, string> = {
  fullName: "full-name",
  whatsapp: "wa-number",
  email: "email",
  password: "password",
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

  const [stage, setStage] = useState<Stage>("young");
  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [partnerName, setPartnerName] = useState("");
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
    if (!agree) next.agree = "Setujui Ketentuan Layanan & Kebijakan Privasi untuk melanjutkan.";
    setErrors(next);

    const firstInvalid = (Object.keys(FIELD_IDS) as FieldName[]).find((k) => next[k]);
    if (firstInvalid || !wa) {
      if (firstInvalid) formRef.current?.querySelector<HTMLElement>(`#${FIELD_IDS[firstInvalid]}`)?.focus();
      return;
    }

    setSubmitting(true);
    const result = await registerAccount({
      stage,
      fullName: fullName.trim(),
      whatsapp: wa,
      email: email.trim(),
      password,
      partnerName: partnerName.trim() || undefined,
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
      {/* Tahap perjalanan */}
      <div
        role="radiogroup"
        aria-label="Tahap perjalanan"
        className="mb-2 flex gap-1 rounded-full bg-canvas-ivory p-1.5 shadow-sm"
      >
        {STAGES.map((s) => {
          const active = stage === s.value;
          return (
            <label
              key={s.value}
              className={`t-title-sm flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full px-3 py-2 text-center transition-all duration-200 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary ${
                active
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <input
                type="radio"
                name="stage"
                value={s.value}
                checked={active}
                onChange={() => setStage(s.value)}
                className="sr-only"
              />
              <Icon name={s.icon} size={16} />
              <span className="truncate">{s.label}</span>
            </label>
          );
        })}
      </div>

      <Field
        id="full-name"
        name="fullName"
        label="Nama Lengkap"
        hint={<span className="t-label-sm font-normal text-text-muted">Wajib</span>}
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
        hint={
          <span className="t-label-sm flex items-center gap-1 font-normal text-primary">
            <Icon name="sync" size={12} />
            Sinkron Harian
          </span>
        }
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
        help="Prompt harian & notifikasi refleksi akan disinkronkan ke nomor ini."
        helpIcon="mark_chat_unread"
      />

      <Field
        id="email"
        name="email"
        label="Alamat Email"
        hint={<span className="t-label-sm font-normal text-text-muted">Untuk Ringkasan Cohort</span>}
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

      <div className="mt-1">
        <Field
          id="partner-name"
          name="partnerName"
          label="Nama Pasangan"
          hint={
            <span className="t-label-sm rounded-full bg-canvas-sand/40 px-2 py-0.5 font-normal text-tertiary">
              Opsional
            </span>
          }
          icon="diversity_1"
          type="text"
          autoComplete="off"
          placeholder="Nama pasangan Anda"
          value={partnerName}
          onChange={(e) => setPartnerName(e.target.value)}
          help="Untuk menghubungkan jurnal refleksi saat cohort aktif bersama."
          helpIcon="handshake"
        />
      </div>

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

      <div className="my-1 flex items-center gap-3">
        <div className="h-px flex-1 bg-canvas-sand" />
        <span className="t-label-sm tracking-wider text-text-muted uppercase">Atau Masuk Cepat</span>
        <div className="h-px flex-1 bg-canvas-sand" />
      </div>

      <ComingSoonButton
        feature="Daftar dengan Google"
        className="t-title-sm flex w-full items-center justify-center gap-3 rounded-full bg-canvas-ivory px-4 py-3 text-on-surface shadow-sm transition-all hover:bg-canvas-cream active:scale-[0.98]"
      >
        <GoogleIcon className="size-5" />
        <span>Daftar dengan Akun Google</span>
      </ComingSoonButton>
    </form>
  );
}
