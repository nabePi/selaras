import type { BlogNode } from "@/lib/blog-content";
import { TEAM } from "./team";

const MB = 1024 * 1024;

export type CareFileKind = "image" | "audio" | "video" | "document";

export type CareFile = {
  id?: number;
  /** Kunci objek di R2. */
  key: string;
  name: string;
  mime: string;
  size: number;
  kind: CareFileKind;
  /** URL baca bertanda tangan (dari server) atau blob lokal (baru diunggah). */
  url?: string;
};

export type CoacheeCare = {
  id: string;
  title: string;
  /** Dokumen Tiptap (lihat lib/blog-content); tanpa media, lampiran ada di `files`. */
  message: BlogNode;
  authorName: string;
  /** ISO `YYYY-MM-DD` (WIB). */
  date: string;
  dateLabel: string;
  timeLabel: string;
  files: CareFile[];
};

const DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

export function careFileKind(mime: string): CareFileKind | null {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("audio/")) return "audio";
  if (mime.startsWith("video/")) return "video";
  if (DOCUMENT_TYPES.includes(mime)) return "document";
  return null;
}

export const CARE_LIMITS: Record<CareFileKind, { maxBytes: number; label: string }> = {
  image: { maxBytes: 20 * MB, label: "20 MB" },
  document: { maxBytes: 200 * MB, label: "200 MB" },
  audio: { maxBytes: 500 * MB, label: "500 MB" },
  video: { maxBytes: 4096 * MB, label: "4 GB" },
};

export const CARE_ACCEPT = `image/*,audio/*,video/*,${DOCUMENT_TYPES.join(",")},.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx`;
export const CARE_FORMATS = "PDF, Word, Excel, PowerPoint, audio, video, atau gambar";
export const MAX_CARE_FILES = 20;

/** Coach yang bisa dipilih admin sebagai pemberi coachee care; nama lengkap bergelar sama dengan di beranda. */
export const CARE_COACHES = (["anggit", "ezie"] as const).map((slug) => ({
  slug,
  name: TEAM.find((m) => m.slug === slug)!.name,
}));
export type CareCoachSlug = (typeof CARE_COACHES)[number]["slug"];
