import "server-only";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { formatDateId } from "@/data/admin-prompts";
import { CARE_COACHES, CARE_LIMITS, careFileKind, MAX_CARE_FILES, type CareFile, type CoacheeCare } from "@/data/coachee-care";
import { InvalidDocError, isDocEmpty, mediaKeysOf, plainText, sanitizeDoc, type BlogNode } from "@/lib/blog-content";
import { userCode } from "@/lib/codes";
import { db } from "@/lib/db";
import { ApiError, notFound } from "@/lib/server/errors";
import { deleteObjects, headObject, presignRead, presignUpload, r2Configured } from "@/lib/server/r2";
import { isoDateWib, timeWib } from "@/lib/server/time";

const PREFIX = "coachee-care/";

const presignSchema = z.object({
  name: z.string().trim().min(1).max(200),
  type: z.string().max(150),
  size: z.number().int().positive(),
});

/** URL unggah (PUT langsung dari peramban ke R2) untuk satu berkas coachee care. */
export async function createCareUploadUrl(body: unknown) {
  const { name, type, size } = presignSchema.parse(body);
  const kind = careFileKind(type);
  if (!kind) throw new ApiError(400, `${name}: format tidak didukung.`);
  if (size > CARE_LIMITS[kind].maxBytes) throw new ApiError(400, `${name}: melebihi batas ${CARE_LIMITS[kind].label}.`);
  if (!r2Configured()) throw new ApiError(503, "Penyimpanan berkas belum dikonfigurasi.");

  const safe = name.replace(/[^\w.-]+/g, "_").slice(-80);
  const key = `${PREFIX}${randomUUID()}-${safe}`;
  return { key, uploadUrl: await presignUpload(key, type) };
}

/** Membuang unggahan yang dibatalkan sebelum disimpan; berkas yang sudah terpakai tidak boleh dihapus. */
export async function discardCareUpload(body: unknown) {
  const { key } = z.object({ key: z.string().min(1).max(500) }).parse(body);
  if (!key.startsWith(PREFIX) || key.includes("..")) throw new ApiError(403, "Akses ditolak.");
  if (await db.coacheeCareFile.findUnique({ where: { key }, select: { id: true } }))
    throw new ApiError(409, "Berkas sedang dipakai.");
  await deleteObjects([key]);
}

const inputSchema = z.object({
  coach: z.enum(CARE_COACHES.map((c) => c.slug) as [string, ...string[]], { error: "Pilih coach pemberi care." }),
  title: z.string().trim().min(3, "Judul minimal 3 karakter.").max(160),
  message: z.unknown(),
  files: z
    .array(z.object({ key: z.string().min(1).max(500), name: z.string().trim().min(1).max(200) }))
    .max(MAX_CARE_FILES, `Maksimal ${MAX_CARE_FILES} berkas.`)
    .default([]),
});

export const withFiles = { files: { orderBy: { id: "asc" } } } satisfies Prisma.CoacheeCareInclude;
type Row = Prisma.CoacheeCareGetPayload<{ include: typeof withFiles }>;

export async function toCare(row: Row): Promise<CoacheeCare> {
  const date = isoDateWib(row.createdAt);
  const files = await Promise.all(
    row.files.map(async (f): Promise<CareFile> => ({
      id: f.id,
      key: f.key,
      name: f.name,
      mime: f.mime,
      size: Number(f.size),
      kind: careFileKind(f.mime) ?? "document",
      url: r2Configured() ? await presignRead(f.key) : undefined,
    })),
  );
  return {
    id: String(row.id),
    title: row.title,
    message: row.message as BlogNode,
    authorName: row.authorName,
    date,
    dateLabel: formatDateId(date),
    timeLabel: timeWib(row.createdAt),
    files,
    reaction: row.reaction && row.reactedAt ? { emoji: row.reaction, dateLabel: formatDateId(isoDateWib(row.reactedAt)) } : null,
  };
}

/** Pesan hanya teks berformat: media disisipkan sebagai lampiran, bukan di dalam pesan. */
function cleanMessage(raw: unknown): BlogNode {
  let doc: BlogNode;
  try {
    doc = sanitizeDoc(raw);
  } catch (e) {
    if (e instanceof InvalidDocError) throw new ApiError(400, e.message, { message: e.message });
    throw e;
  }
  if (mediaKeysOf(doc).length) throw new ApiError(400, "Lampirkan media lewat bagian Lampiran.", { message: "Media tidak didukung di pesan." });
  if (isDocEmpty(doc)) throw new ApiError(400, "Pesan care wajib diisi.", { message: "Pesan care wajib diisi." });
  if (plainText(doc).length > 50000) throw new ApiError(400, "Pesan terlalu panjang.", { message: "Pesan terlalu panjang." });
  return doc;
}

async function findMember(code: string) {
  const id = userCode.parse(code);
  const user = id && (await db.user.findFirst({ where: { id, role: "MEMBER" }, select: { id: true, name: true } }));
  if (!user) throw notFound("Pengguna");
  return user;
}

/** Peserta beserta seluruh coachee care untuknya (terbaru lebih dulu); null bila peserta tidak ada. */
export async function listCoacheeCare(code: string) {
  const user = await findMember(code).catch(() => null);
  if (!user) return null;
  const rows = await db.coacheeCare.findMany({ where: { userId: user.id }, include: withFiles, orderBy: { createdAt: "desc" } });
  return { user: { id: userCode.format(user.id), name: user.name }, items: await Promise.all(rows.map(toCare)) };
}

export async function getMemberName(code: string) {
  const user = await findMember(code).catch(() => null);
  return user && { id: userCode.format(user.id), name: user.name };
}

export async function createCoacheeCare(code: string, body: unknown) {
  const user = await findMember(code);
  const input = inputSchema.parse(body);
  const message = cleanMessage(input.message);
  const keys = input.files.map((f) => f.key);
  if (new Set(keys).size !== keys.length) throw new ApiError(400, "Berkas yang sama tidak boleh dilampirkan dua kali.");

  const files = await Promise.all(
    input.files.map(async ({ key, name }) => {
      if (!key.startsWith(PREFIX) || key.includes("..")) throw new ApiError(403, "Akses ditolak.");
      const head = await headObject(key);
      const kind = head && careFileKind(head.contentType);
      if (!head || !kind) throw new ApiError(400, `${name}: berkas belum terunggah atau formatnya tidak didukung.`);
      if (head.size > CARE_LIMITS[kind].maxBytes) {
        await deleteObjects([key]);
        throw new ApiError(400, `${name}: melebihi batas ${CARE_LIMITS[kind].label}.`);
      }
      return { key, name, mime: head.contentType, size: head.size };
    }),
  );
  const authorName = CARE_COACHES.find((c) => c.slug === input.coach)!.name;
  const row = await db.$transaction(async (tx) => {
    const care = await tx.coacheeCare.create({
      data: { userId: user.id, title: input.title, message: message as Prisma.InputJsonObject, authorName, files: { create: files } },
      include: withFiles,
    });
    // Peserta hanya diberi tahu; isi coachee care tidak ikut dikirim ke notifikasi.
    await tx.notification.create({
      data: {
        userId: user.id,
        kind: "PESAN",
        title: "Kamu mendapat Coachee Care",
        body: `Kamu mendapat coachee care dari ${authorName}.`,
        detail: `Kamu mendapat coachee care dari ${authorName}.`,
        href: `/coachee-care/${care.id}`,
        actionLabel: "Baca Coachee Care",
      },
    });
    return care;
  });
  return toCare(row);
}

export async function deleteCoacheeCare(careId: string) {
  const n = Number(careId);
  const row = Number.isSafeInteger(n) && n > 0 ? await db.coacheeCare.findUnique({ where: { id: n }, include: withFiles }) : null;
  if (!row) throw notFound("Coachee care");
  await db.coacheeCare.delete({ where: { id: n } });
  await deleteObjects(row.files.map((f) => f.key));
}
