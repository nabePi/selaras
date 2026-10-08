/** Tipe kelas & sesi yang dikelola admin (dipakai bersama oleh server dan form). */

export type CourseFile = {
  /** Kunci objek di R2. */
  key: string;
  name: string;
  size: number;
  /** URL baca bertanda tangan (hanya terisi saat dibaca dari server). */
  url?: string;
};

export type SessionMode = "ONLINE" | "OFFLINE" | "HYBRID";

export const SESSION_MODES: { value: SessionMode; label: string }[] = [
  { value: "ONLINE", label: "Online" },
  { value: "OFFLINE", label: "Offline" },
  { value: "HYBRID", label: "Hybrid" },
];

export const sessionModeLabel = (mode: SessionMode) => SESSION_MODES.find((m) => m.value === mode)?.label ?? "Online";
export const hasOnline = (mode: SessionMode) => mode !== "OFFLINE";
export const hasOffline = (mode: SessionMode) => mode !== "ONLINE";

export type CourseSession = {
  /** Kunci lokal untuk daftar di form; bukan id database. */
  uid: string;
  title: string;
  /** ISO `YYYY-MM-DD`. */
  date: string;
  /** `HH:MM` (WIB) atau kosong. */
  time: string;
  mode: SessionMode;
  /** Tautan Zoom / Meet; kosong untuk sesi offline. */
  meetingUrl: string;
  /** Nama lokasi acara; kosong untuk sesi online. */
  locationName: string;
  /** Tautan Google Maps lokasi acara. */
  mapsUrl: string;
  instructorName: string;
  instructorBio: string;
  instructorPhoto: CourseFile | null;
  recording: CourseFile | null;
  documents: CourseFile[];
};

export type Course = {
  id: string;
  title: string;
  description: string;
  posters: CourseFile[];
  sessions: CourseSession[];
  /** Jumlah peserta yang didaftarkan admin. */
  enrolledCount: number;
};

export type Participant = { id: number; name: string; whatsapp: string; email: string | null };

export type UploadPurpose = "poster" | "instructor" | "recording" | "document";

const MB = 1024 * 1024;

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export const UPLOAD_RULES: Record<
  UploadPurpose,
  { accept: string; maxBytes: number; maxLabel: string; allows: (mime: string) => boolean; formats: string }
> = {
  poster: { accept: IMAGE_TYPES.join(","), maxBytes: 5 * MB, maxLabel: "5 MB", allows: (m) => IMAGE_TYPES.includes(m), formats: "JPG, PNG, atau WebP" },
  instructor: { accept: IMAGE_TYPES.join(","), maxBytes: 5 * MB, maxLabel: "5 MB", allows: (m) => IMAGE_TYPES.includes(m), formats: "JPG, PNG, atau WebP" },
  recording: { accept: "video/*", maxBytes: 2048 * MB, maxLabel: "2 GB", allows: (m) => m.startsWith("video/"), formats: "video (MP4, MOV, WebM)" },
  document: {
    accept: `${DOCUMENT_TYPES.join(",")},.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx`,
    maxBytes: 50 * MB,
    maxLabel: "50 MB",
    allows: (m) => DOCUMENT_TYPES.includes(m),
    formats: "PDF, Word, PowerPoint, atau Excel",
  },
};

export const formatFileSize = (bytes: number) =>
  bytes >= 1024 * MB ? `${(bytes / 1024 / MB).toFixed(1)} GB` : `${(bytes / MB).toFixed(1)} MB`;

/** Tautan Google Maps (maps.app.goo.gl, goo.gl/maps, google.com/maps, maps.google.com). */
export function isMapsUrl(url: string): boolean {
  try {
    const { protocol, hostname, pathname } = new URL(url);
    if (!["http:", "https:"].includes(protocol)) return false;
    const h = hostname.replace(/^www\./, "");
    return (
      h === "maps.app.goo.gl" ||
      h === "maps.google.com" ||
      (h === "goo.gl" && pathname.startsWith("/maps")) ||
      (/^google\.[a-z.]+$/.test(h) && pathname.startsWith("/maps"))
    );
  } catch {
    return false;
  }
}

/** Nama platform dari tautan rapat. */
export function meetingPlatform(url: string): string | null {
  try {
    const host = new URL(url).hostname;
    if (host.endsWith("zoom.us") || host.endsWith("zoom.com")) return "Zoom";
    if (host === "meet.google.com") return "Google Meet";
    return "Tautan";
  } catch {
    return null;
  }
}
