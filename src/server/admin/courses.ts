import "server-only";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { hasOffline, hasOnline, isMapsUrl, UPLOAD_RULES, type Course, type CourseFile, type Participant, type UploadPurpose } from "@/data/courses";
import { db } from "@/lib/db";
import { ApiError, notFound } from "@/lib/server/errors";
import { deleteObjects, headObject, presignRead, presignUpload, r2Configured } from "@/lib/server/r2";
import { isoDate } from "@/lib/server/time";

const PURPOSES = ["poster", "instructor", "recording", "document"] as const;
const prefixFor = (purpose: UploadPurpose) => `courses/${purpose}/`;

const presignSchema = z.object({
  purpose: z.enum(PURPOSES),
  name: z.string().trim().min(1).max(200),
  type: z.string().max(150),
  size: z.number().int().positive(),
});

/** URL unggah (PUT langsung dari peramban ke R2) untuk berkas kelas. */
export async function createCourseUploadUrl(body: unknown) {
  const { purpose, name, type, size } = presignSchema.parse(body);
  const rule = UPLOAD_RULES[purpose];
  if (!rule.allows(type)) throw new ApiError(400, `${name}: format tidak didukung (gunakan ${rule.formats}).`);
  if (size > rule.maxBytes) throw new ApiError(400, `${name}: melebihi batas ${rule.maxLabel}.`);
  if (!r2Configured()) throw new ApiError(503, "Penyimpanan berkas belum dikonfigurasi.");

  const safe = name.replace(/[^\w.-]+/g, "_").slice(-80);
  const key = `${prefixFor(purpose)}${randomUUID()}-${safe}`;
  return { key, uploadUrl: await presignUpload(key, type) };
}

const fileSchema = z.object({
  key: z.string().min(1).max(500),
  name: z.string().trim().min(1).max(200),
  size: z.number().int().nonnegative(),
});

const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => {
    if (!v) return true;
    try {
      return ["http:", "https:"].includes(new URL(v).protocol);
    } catch {
      return false;
    }
  }, "Tautan harus diawali https://");

export const courseSchema = z.object({
  title: z.string().trim().min(3, "Judul kelas minimal 3 karakter.").max(120),
  description: z.string().trim().max(4000).default(""),
  posters: z.array(fileSchema).max(10, "Maksimal 10 poster.").default([]),
  sessions: z
    .array(
      z.object({
        title: z.string().trim().min(3, "Judul sesi minimal 3 karakter.").max(160),
        date: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal sesi wajib diisi.")
          .refine((v) => !Number.isNaN(Date.parse(`${v}T00:00:00Z`)), "Tanggal tidak valid."),
        time: z.string().trim().regex(/^(\d{2}:\d{2})?$/, "Jam tidak valid.").default(""),
        endTime: z.string().trim().regex(/^(\d{2}:\d{2})?$/, "Jam berakhir tidak valid.").default(""),
        mode: z.enum(["ONLINE", "OFFLINE", "HYBRID"]).default("ONLINE"),
        meetingUrl: optionalUrl.default(""),
        locationName: z.string().trim().max(200).default(""),
        mapsUrl: optionalUrl.default(""),
        instructorName: z.string().trim().max(120).default(""),
        instructorBio: z.string().trim().max(1000).default(""),
        instructorPhoto: fileSchema.nullable().default(null),
        recording: fileSchema.nullable().default(null),
        documents: z.array(fileSchema).max(20).default([]),
      }).superRefine((s, ctx) => {
        if (s.endTime && !s.time) ctx.addIssue({ code: "custom", path: ["endTime"], message: "Isi jam mulai dulu sebelum jam berakhir." });
        else if (s.endTime && s.endTime <= s.time) ctx.addIssue({ code: "custom", path: ["endTime"], message: "Jam berakhir harus setelah jam mulai." });
        if (!hasOffline(s.mode)) return;
        if (!s.locationName) ctx.addIssue({ code: "custom", path: ["locationName"], message: "Nama lokasi wajib diisi untuk sesi offline atau hybrid." });
        if (s.mapsUrl && !isMapsUrl(s.mapsUrl)) ctx.addIssue({ code: "custom", path: ["mapsUrl"], message: "Gunakan tautan Google Maps." });
      }),
    )
    .min(1, "Tambahkan minimal satu sesi.")
    .max(50),
});
export type CourseInput = z.output<typeof courseSchema>;

export const withSessions = {
  _count: { select: { enrollments: true } },
  sessions: { orderBy: { position: "asc" }, include: { documents: { orderBy: { id: "asc" } } } },
} satisfies Prisma.CourseInclude;
type CourseRow = Prisma.CourseGetPayload<{ include: typeof withSessions }>;

async function fileOut(key: string | null, name: string, size: number): Promise<CourseFile | null> {
  if (!key) return null;
  return { key, name, size, url: r2Configured() ? await presignRead(key) : undefined };
}

export async function toCourse(row: CourseRow): Promise<Course> {
  return {
    id: String(row.id),
    title: row.title,
    description: row.description,
    enrolledCount: row._count.enrollments,
    posters: (await Promise.all(row.posterKeys.map((k) => fileOut(k, "Poster", 0)))).filter((f): f is CourseFile => f !== null),
    sessions: await Promise.all(
      row.sessions.map(async (s) => ({
        uid: `s${s.id}`,
        title: s.title,
        date: isoDate(s.date),
        time: s.time,
        endTime: s.endTime,
        mode: s.mode,
        meetingUrl: s.meetingUrl,
        locationName: s.locationName,
        mapsUrl: s.mapsUrl,
        instructorName: s.instructorName,
        instructorBio: s.instructorBio,
        instructorPhoto: await fileOut(s.instructorPhotoKey, "Foto pengajar", 0),
        recording: await fileOut(s.recordingKey, s.recordingName ?? "Rekaman", s.recordingSize ?? 0),
        documents: (await Promise.all(s.documents.map((d) => fileOut(d.key, d.name, d.size)))).filter(
          (d): d is CourseFile => d !== null,
        ),
      })),
    ),
  };
}

function parseId(id: string) {
  const n = Number(id);
  if (!Number.isSafeInteger(n) || n <= 0) throw notFound("Kelas");
  return n;
}

export async function listCourses(): Promise<Course[]> {
  const rows = await db.course.findMany({ include: withSessions, orderBy: { createdAt: "desc" } });
  return Promise.all(rows.map(toCourse));
}

export async function getCourse(id: string): Promise<Course | null> {
  const n = Number(id);
  if (!Number.isSafeInteger(n) || n <= 0) return null;
  const row = await db.course.findUnique({ where: { id: n }, include: withSessions });
  return row ? toCourse(row) : null;
}

/** Semua kunci R2 yang dipakai sebuah kelas (poster, foto pengajar, rekaman, dokumen). */
function keysOf(c: {
  posterKeys: string[];
  sessions: { instructorPhotoKey: string | null; recordingKey: string | null; documents: { key: string }[] }[];
}) {
  return [
    ...c.posterKeys,
    ...c.sessions.flatMap((s) => [s.instructorPhotoKey, s.recordingKey, ...s.documents.map((d) => d.key)]),
  ].filter((k): k is string => !!k);
}

/**
 * Memastikan tiap berkas valid: kunci berawalan sesuai jenisnya, sudah ada di R2, dan ukurannya
 * dalam batas. Berkas yang sudah tersimpan di kelas ini (`known`) tidak diperiksa ulang.
 */
async function verifyFile(
  file: { key: string; name: string; size: number } | null,
  purpose: UploadPurpose,
  known: Set<string>,
): Promise<{ key: string; name: string; size: number } | null> {
  if (!file) return null;
  if (known.has(file.key)) return file;
  if (!file.key.startsWith(prefixFor(purpose)) || file.key.includes("..")) throw new ApiError(403, "Akses ditolak.");
  const rule = UPLOAD_RULES[purpose];
  const head = await headObject(file.key);
  if (!head || !rule.allows(head.contentType)) throw new ApiError(400, `${file.name}: berkas belum terunggah atau formatnya tidak didukung.`);
  if (head.size > rule.maxBytes) {
    await deleteObjects([file.key]);
    throw new ApiError(400, `${file.name}: melebihi batas ${rule.maxLabel}.`);
  }
  return { key: file.key, name: file.name, size: head.size };
}

async function verifyPosters(posters: CourseInput["posters"], known: Set<string>) {
  if (new Set(posters.map((p) => p.key)).size !== posters.length) throw new ApiError(400, "Poster yang sama tidak boleh diunggah dua kali.");
  const verified = await Promise.all(posters.map((p) => verifyFile(p, "poster", known)));
  return verified.flatMap((p) => (p ? [p.key] : []));
}

async function sessionData(input: CourseInput, known: Set<string>) {
  return Promise.all(
    input.sessions.map(async (s, position) => {
      const photo = await verifyFile(s.instructorPhoto, "instructor", known);
      const recording = await verifyFile(s.recording, "recording", known);
      const documents = await Promise.all(s.documents.map((d) => verifyFile(d, "document", known)));
      return {
        position,
        title: s.title,
        date: new Date(`${s.date}T00:00:00Z`),
        time: s.time,
        endTime: s.endTime,
        mode: s.mode,
        // Kolom yang tidak berlaku untuk mode sesi dikosongkan agar tidak tersisa data lama.
        meetingUrl: hasOnline(s.mode) ? s.meetingUrl : "",
        locationName: hasOffline(s.mode) ? s.locationName : "",
        mapsUrl: hasOffline(s.mode) ? s.mapsUrl : "",
        instructorName: s.instructorName,
        instructorBio: s.instructorBio,
        instructorPhotoKey: photo?.key ?? null,
        recordingKey: recording?.key ?? null,
        recordingName: recording?.name ?? null,
        recordingSize: recording?.size ?? null,
        documents: { create: documents.flatMap((d) => (d ? [{ key: d.key, name: d.name, size: d.size }] : [])) },
      };
    }),
  );
}

/** Rekaman dan dokumen milik satu sesi; foto pengajar boleh dipakai bersama antar sesi. */
function assertUniqueKeys(input: CourseInput) {
  const keys = input.sessions
    .flatMap((s) => [s.recording?.key, ...s.documents.map((d) => d.key)])
    .filter((k): k is string => !!k);
  if (new Set(keys).size !== keys.length) throw new ApiError(400, "Satu rekaman atau dokumen tidak boleh dipakai di lebih dari satu sesi.");
}

export async function createCourse(input: CourseInput): Promise<Course> {
  assertUniqueKeys(input);
  const known = new Set<string>();
  const posters = await verifyPosters(input.posters, known);
  const sessions = await sessionData(input, known);
  const row = await db.course.create({
    data: {
      title: input.title,
      description: input.description,
      posterKeys: posters,
      sessions: { create: sessions },
    },
    include: withSessions,
  });
  return toCourse(row);
}

export async function updateCourse(id: string, input: CourseInput): Promise<Course> {
  const n = parseId(id);
  assertUniqueKeys(input);
  const existing = await db.course.findUnique({ where: { id: n }, include: withSessions });
  if (!existing) throw notFound("Kelas");
  const oldKeys = keysOf(existing);
  const known = new Set(oldKeys);

  const posters = await verifyPosters(input.posters, known);
  const sessions = await sessionData(input, known);
  const row = await db.$transaction(async (tx) => {
    await tx.courseSession.deleteMany({ where: { courseId: n } });
    return tx.course.update({
      where: { id: n },
      data: {
        title: input.title,
        description: input.description,
        posterKeys: posters,
        sessions: { create: sessions },
      },
      include: withSessions,
    });
  });
  // Berkas yang diganti atau dilepas dari kelas tidak dipakai lagi.
  const kept = new Set(keysOf(row));
  await deleteObjects(oldKeys.filter((k) => !kept.has(k)));
  return toCourse(row);
}

export async function deleteCourse(id: string): Promise<{ deletedFiles: number }> {
  const n = parseId(id);
  const existing = await db.course.findUnique({ where: { id: n }, include: withSessions });
  if (!existing) throw notFound("Kelas");
  await db.course.delete({ where: { id: n } });
  const keys = keysOf(existing);
  await deleteObjects(keys);
  return { deletedFiles: keys.length };
}

/** Membuang unggahan yang dibatalkan admin sebelum kelas disimpan. Hanya berkas di `courses/`. */
export async function discardCourseUpload(body: unknown) {
  const { key } = z.object({ key: z.string().min(1).max(500) }).parse(body);
  if (!key.startsWith("courses/") || key.includes("..")) throw new ApiError(403, "Akses ditolak.");
  // Berkas yang sudah terpakai kelas tidak boleh dihapus lewat jalur ini.
  const used =
    (await db.course.findFirst({ where: { posterKeys: { has: key } }, select: { id: true } })) ??
    (await db.courseSession.findFirst({
      where: { OR: [{ instructorPhotoKey: key }, { recordingKey: key }] },
      select: { id: true },
    })) ??
    (await db.courseDocument.findUnique({ where: { key }, select: { id: true } }));
  if (used) throw new ApiError(409, "Berkas sedang dipakai kelas.");
  await deleteObjects([key]);
}

const participantSelect = { id: true, name: true, whatsapp: true, email: true } satisfies Prisma.UserSelect;

async function assertCourse(id: string) {
  const n = parseId(id);
  if (!(await db.course.findUnique({ where: { id: n }, select: { id: true } }))) throw notFound("Kelas");
  return n;
}

/** Peserta yang sudah terdaftar di kelas, dan peserta aktif lain yang masih bisa didaftarkan. */
export async function getEnrollments(id: string): Promise<{ enrolled: Participant[]; available: Participant[] }> {
  const courseId = await assertCourse(id);
  const [rows, available] = await Promise.all([
    db.courseEnrollment.findMany({
      where: { courseId },
      select: { user: { select: participantSelect } },
      orderBy: { createdAt: "asc" },
    }),
    db.user.findMany({
      where: { role: "MEMBER", status: "ACTIVE", courseEnrollments: { none: { courseId } } },
      select: participantSelect,
      orderBy: { name: "asc" },
    }),
  ]);
  return { enrolled: rows.map((r) => r.user), available };
}

const enrollSchema = z.object({ userId: z.number().int().positive() });

export async function enrollParticipant(id: string, body: unknown) {
  const courseId = await assertCourse(id);
  const { userId } = enrollSchema.parse(body);
  const user = await db.user.findUnique({ where: { id: userId }, select: { role: true, status: true } });
  if (!user || user.role !== "MEMBER") throw notFound("Peserta");
  if (user.status !== "ACTIVE") throw new ApiError(409, "Peserta belum aktif, aktifkan akunnya dulu.");
  await db.courseEnrollment.upsert({
    where: { courseId_userId: { courseId, userId } },
    create: { courseId, userId },
    update: {},
  });
  return getEnrollments(id);
}

export async function unenrollParticipant(id: string, userId: string) {
  const courseId = await assertCourse(id);
  const uid = Number(userId);
  if (!Number.isSafeInteger(uid) || uid <= 0) throw notFound("Peserta");
  await db.courseEnrollment.deleteMany({ where: { courseId, userId: uid } });
  return getEnrollments(id);
}
