/**
 * SIMULASI — belum ada backend.
 *
 * Fungsi-fungsi ini adalah satu-satunya titik yang perlu diganti dengan panggilan API
 * (route handler / server action) saat autentikasi tersedia. Form di
 * `components/auth/*` sudah menangani hasil `{ ok: false, error }` dan keadaan loading.
 */

export type AuthResult = { ok: true } | { ok: false; error: string };

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type SignInInput = {
  /** Email atau nomor WhatsApp */
  identifier: string;
  password: string;
  remember: boolean;
};

export async function signIn(input: SignInInput): Promise<AuthResult> {
  void input;
  await delay(900);
  return { ok: true };
}

export type RegisterInput = {
  fullName: string;
  /** Nomor WhatsApp nasional tanpa awalan, mis. "81234567890" */
  whatsapp: string;
  email: string;
  password: string;
  partnerName?: string;
};

export async function registerAccount(input: RegisterInput): Promise<AuthResult> {
  void input;
  await delay(1100);
  return { ok: true };
}

export async function requestPasswordReset(target: string): Promise<AuthResult> {
  void target;
  await delay(600);
  return { ok: true };
}
