import "server-only";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { ApiError } from "@/lib/server/errors";
import { deleteObjects, headObject, presignRead, presignUpload, r2Configured } from "@/lib/server/r2";

export const AVATAR_TYPES = { "image/webp": "webp", "image/png": "png", "image/jpeg": "jpg" } as const;
export const MAX_AVATAR_BYTES = 1024 * 1024;

const prefixFor = (userId: number) => `avatars/${userId}/`;

/** Nilai lama/eksternal (data URL, http(s), path publik) dipakai apa adanya; selain itu berarti key R2. */
const isKey = (stored: string) => !/^(data:|https?:\/\/|\/)/.test(stored);

/**
 * Nilai kolom `User.avatarUrl` -> URL yang bisa dipakai UI. Foto di R2 diberi URL baca bertanda
 * tangan (berlaku 1 jam); foto lama berbentuk data URL tetap tampil sampai dimigrasikan.
 */
export async function avatarSrc(stored: string | null | undefined): Promise<string | undefined> {
  if (!stored) return undefined;
  if (!isKey(stored)) return stored;
  return r2Configured() ? presignRead(stored) : undefined;
}

const presignSchema = z.object({
  type: z.enum(Object.keys(AVATAR_TYPES) as [keyof typeof AVATAR_TYPES, ...(keyof typeof AVATAR_TYPES)[]]),
  size: z.number().int().positive().max(MAX_AVATAR_BYTES, "Ukuran foto terlalu besar (maks 1 MB)."),
});

/** URL unggah (PUT langsung dari peramban ke R2) untuk foto profil. */
export async function createAvatarUploadUrl(userId: number, body: unknown) {
  const { type } = presignSchema.parse(body);
  const key = `${prefixFor(userId)}${randomUUID()}.${AVATAR_TYPES[type]}`;
  return { key, uploadUrl: await presignUpload(key, type) };
}

/** Memastikan key milik peserta, benar-benar sudah terunggah, berupa gambar, dan tidak melebihi batas. */
export async function verifyAvatarKey(userId: number, key: string) {
  if (!key.startsWith(prefixFor(userId)) || key.includes("..")) throw new ApiError(403, "Akses ditolak.");
  if (!r2Configured()) throw new ApiError(503, "Penyimpanan foto belum dikonfigurasi.");
  const head = await headObject(key);
  if (!head || !(head.contentType in AVATAR_TYPES)) throw new ApiError(400, "Foto belum terunggah.", { avatar: "Foto belum terunggah." });
  if (head.size > MAX_AVATAR_BYTES) {
    await deleteObjects([key]);
    throw new ApiError(400, "Ukuran foto terlalu besar (maks 1 MB).", { avatar: "Ukuran foto terlalu besar." });
  }
}

/** Menghapus foto lama dari R2 (abaikan nilai lama berbentuk data URL/URL). */
export async function deleteStoredAvatar(stored: string | null | undefined) {
  if (stored && isKey(stored)) await deleteObjects([stored]);
}
