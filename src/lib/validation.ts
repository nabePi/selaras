const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isEmail(value: string) {
  return EMAIL_RE.test(value.trim());
}

/**
 * Menormalkan nomor WhatsApp Indonesia ke bentuk nasional tanpa awalan (mis. "81234567890").
 * Menerima "0812…", "+62 812…", "62812…", atau "812…". Mengembalikan null bila tidak valid.
 */
export function normalizeWhatsApp(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("62")) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = digits.slice(1);
  return /^8\d{8,12}$/.test(digits) ? digits : null;
}

export type PasswordStrength = {
  /** 0 (kosong) sampai 4 */
  level: 0 | 1 | 2 | 3 | 4;
  label: "Lemah" | "Cukup" | "Sedang" | "Kuat" | "Kokoh";
};

const STRENGTH_LABELS = ["Lemah", "Cukup", "Sedang", "Kuat", "Kokoh"] as const;

export function passwordStrength(value: string): PasswordStrength {
  let level = 0;
  if (value.length >= 6) level++;
  if (value.length >= 8) level++;
  if (/[A-Z]/.test(value) && /[0-9]/.test(value)) level++;
  if (/[^A-Za-z0-9]/.test(value)) level++;
  const l = (value ? level : 0) as PasswordStrength["level"];
  return { level: l, label: STRENGTH_LABELS[l] };
}
