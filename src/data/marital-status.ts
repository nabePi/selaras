/** Status pernikahan yang bisa diisi peserta di halaman profil. */
export const MARITAL_STATUSES = [
  { value: "menikah", label: "Menikah" },
  { value: "belum-menikah", label: "Belum Menikah" },
] as const;

export type MaritalStatus = (typeof MARITAL_STATUSES)[number]["value"];

export const maritalLabel = (value: string | null | undefined) =>
  MARITAL_STATUSES.find((s) => s.value === value)?.label ?? null;
