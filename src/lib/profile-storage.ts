/** Kunci localStorage untuk data profil member (dibaca halaman profil dan admin). */
export const PROFILE_NAME_KEY = "selaras:profile:full-name";
export const PROFILE_AVATAR_KEY = "selaras:profile:avatar";
export const PROFILE_SKILLS_KEY = "selaras:profile:skills";

export function parseSkills(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value)
      ? value.filter((v): v is string => typeof v === "string")
      : [];
  } catch {
    return [];
  }
}
