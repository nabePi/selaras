import "server-only";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import type { ResponseAttachment } from "@/data/prompt-responses";
import { attachmentKind, formatSize, maxBytesFor } from "@/lib/attachments";
import { ApiError } from "@/lib/server/errors";
import { deleteObjects, headObject, presignRead, presignUpload, r2Configured } from "@/lib/server/r2";
import { todayWib } from "@/lib/server/time";

const prefixFor = (userId: number) => `journal/${userId}/`;

const presignSchema = z.object({
  name: z.string().trim().min(1).max(200),
  type: z.string().max(100),
  size: z.number().int().positive(),
});

/** URL unggah (PUT langsung dari peramban ke R2) untuk satu berkas. */
export async function createUploadUrl(userId: number, body: unknown) {
  const { name, type, size } = presignSchema.parse(body);
  const kind = attachmentKind(type);
  if (!kind) throw new ApiError(400, `${name}: format tidak didukung.`);
  if (size > maxBytesFor(kind))
    throw new ApiError(400, kind === "image" ? `${name}: foto melebihi batas 5 MB.` : `${name}: melebihi batas 100 MB.`);

  const safe = name.replace(/[^\w.-]+/g, "_").slice(-80);
  const key = `${prefixFor(userId)}${todayWib()}/${randomUUID()}-${safe}`;
  return { key, kind, uploadUrl: await presignUpload(key, type) };
}

const keySchema = z.object({ key: z.string().min(1).max(500) });

/** Menghapus unggahan yang dibatalkan peserta sebelum jurnal dikirim. Hanya milik sendiri. */
export async function discardUpload(userId: number, body: unknown) {
  const { key } = keySchema.parse(body);
  if (!key.startsWith(prefixFor(userId))) throw new ApiError(403, "Akses ditolak.");
  await deleteObjects([key]);
}

export type NewAttachment = { key: string; name: string };

/** Memeriksa bahwa objek benar-benar ada di R2, milik peserta, dan sesuai batas ukuran. */
export async function verifyNewAttachments(
  userId: number,
  added: NewAttachment[],
): Promise<Prisma.PromptAttachmentCreateWithoutResponseInput[]> {
  if (added.length && !r2Configured()) throw new ApiError(503, "Penyimpanan lampiran belum dikonfigurasi.");
  return Promise.all(
    added.map(async ({ key, name }) => {
      if (!key.startsWith(prefixFor(userId))) throw new ApiError(403, "Akses ditolak.");
      const head = await headObject(key);
      const kind = head && attachmentKind(head.contentType);
      if (!head || !kind) throw new ApiError(400, `${name}: berkas belum terunggah.`);
      if (head.size > maxBytesFor(kind)) {
        await deleteObjects([key]);
        throw new ApiError(400, `${name}: ukuran berkas melebihi batas.`);
      }
      return {
        kind: kind === "image" ? "IMAGE" : kind === "video" ? "VIDEO" : "AUDIO",
        title: name.slice(0, 200),
        key,
        size: head.size,
        meta: `${formatSize(head.size)}`,
      } as const;
    }),
  );
}

type AttachmentRow = {
  id: number;
  kind: "IMAGE" | "AUDIO" | "VIDEO";
  title: string;
  src: string | null;
  poster: string | null;
  meta: string | null;
  key: string | null;
};

/** Baris DB → DTO untuk UI. Berkas R2 diberi URL baca bertanda tangan (berlaku 1 jam). */
export async function toAttachmentDto(a: AttachmentRow): Promise<ResponseAttachment | null> {
  let src = a.src ?? "";
  if (a.key) {
    if (!r2Configured()) return null;
    src = await presignRead(a.key);
  }
  if (a.kind === "IMAGE") return { id: a.id, kind: "image", title: a.title, src };
  if (a.kind === "AUDIO") return { id: a.id, kind: "audio", title: a.title, meta: a.meta ?? "", src: src || undefined };
  return { id: a.id, kind: "video", title: a.title, src, poster: a.poster ?? "" };
}

export async function toAttachmentDtos(rows: AttachmentRow[]): Promise<ResponseAttachment[]> {
  return (await Promise.all(rows.map(toAttachmentDto))).filter((a): a is ResponseAttachment => a !== null);
}
