/**
 * Isi artikel blog: dokumen Tiptap (JSON). Dokumen tidak pernah dirender sebagai HTML mentah, dan
 * hanya node/mark/atribut dalam daftar putih di bawah yang diterima, jadi aman dari XSS.
 */

export type BlogMark = { type: string; attrs?: { href?: string } };
export type BlogNode = {
  type: string;
  attrs?: Record<string, string | number | null>;
  content?: BlogNode[];
  marks?: BlogMark[];
  text?: string;
};

export const MEDIA_TYPES = ["image", "video", "audio"] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];
export const isMediaNode = (type: string): type is MediaType => (MEDIA_TYPES as readonly string[]).includes(type);

/** Awalan kunci R2 berkas blog (sampul, foto penulis, dan media isi artikel). */
export const BLOG_KEY_PREFIX = "blog/";

const BLOCKS = new Set([
  "paragraph",
  "heading",
  "bulletList",
  "orderedList",
  "listItem",
  "blockquote",
  "codeBlock",
  "horizontalRule",
  "hardBreak",
  "image",
  "video",
  "audio",
]);
const MARKS = new Set(["bold", "italic", "underline", "strike", "code", "link"]);
const ALIGNS = new Set(["left", "center", "right"]);
const MAX_NODES = 5000;
const MAX_DEPTH = 12;

export const isSafeHref = (href: string) => {
  try {
    return ["http:", "https:", "mailto:"].includes(new URL(href).protocol);
  } catch {
    return false;
  }
};

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

export class InvalidDocError extends Error {}

function cleanMarks(raw: unknown): BlogMark[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: BlogMark[] = [];
  for (const m of raw) {
    if (!isRecord(m) || typeof m.type !== "string" || !MARKS.has(m.type)) continue;
    if (m.type === "link") {
      const href = isRecord(m.attrs) ? m.attrs.href : undefined;
      if (typeof href === "string" && isSafeHref(href)) out.push({ type: "link", attrs: { href } });
    } else out.push({ type: m.type });
  }
  return out.length ? out : undefined;
}

function cleanAttrs(type: string, raw: unknown): BlogNode["attrs"] {
  const a = isRecord(raw) ? raw : {};
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
  if (isMediaNode(type)) {
    const key = str(a.key, 500);
    if (!key.startsWith(BLOG_KEY_PREFIX) || key.includes("..")) throw new InvalidDocError("Media artikel tidak valid.");
    return type === "image" ? { key, alt: str(a.alt, 300) } : { key };
  }
  if (type === "heading") return { level: a.level === 3 ? 3 : 2, ...(ALIGNS.has(a.textAlign as string) ? { textAlign: a.textAlign as string } : {}) };
  if (type === "paragraph" && ALIGNS.has(a.textAlign as string)) return { textAlign: a.textAlign as string };
  if (type === "orderedList") return { start: typeof a.start === "number" && a.start > 0 && a.start < 1e6 ? Math.floor(a.start) : 1 };
  return undefined;
}

/** Membangun ulang dokumen hanya dari bagian yang diizinkan; melempar InvalidDocError bila rusak. */
export function sanitizeDoc(input: unknown): BlogNode {
  let count = 0;
  const walk = (raw: unknown, depth: number): BlogNode => {
    if (!isRecord(raw) || typeof raw.type !== "string") throw new InvalidDocError("Isi artikel tidak valid.");
    if (++count > MAX_NODES || depth > MAX_DEPTH) throw new InvalidDocError("Isi artikel terlalu panjang.");
    const { type } = raw;
    if (type === "text") {
      if (typeof raw.text !== "string") throw new InvalidDocError("Isi artikel tidak valid.");
      return { type, text: raw.text, marks: cleanMarks(raw.marks) };
    }
    if (type !== "doc" && !BLOCKS.has(type)) throw new InvalidDocError("Isi artikel memuat elemen yang tidak didukung.");
    const node: BlogNode = { type };
    const attrs = cleanAttrs(type, raw.attrs);
    if (attrs) node.attrs = attrs;
    if (Array.isArray(raw.content) && !isMediaNode(type)) node.content = raw.content.map((c) => walk(c, depth + 1));
    return node;
  };
  const doc = walk(input, 0);
  if (doc.type !== "doc") throw new InvalidDocError("Isi artikel tidak valid.");
  return doc;
}

/** Semua kunci R2 media yang dipakai dokumen. */
export function mediaKeysOf(node: BlogNode, out: string[] = []): string[] {
  if (isMediaNode(node.type) && typeof node.attrs?.key === "string") out.push(node.attrs.key);
  node.content?.forEach((c) => mediaKeysOf(c, out));
  return out;
}

/** Teks polos dokumen (untuk ringkasan otomatis, hitung kata, dan deskripsi SEO). */
export function plainText(node: BlogNode): string {
  if (node.type === "text") return node.text ?? "";
  const inner = (node.content ?? []).map(plainText).join(node.type === "doc" || node.type.endsWith("List") ? "\n" : "");
  return inner;
}

export const isDocEmpty = (doc: BlogNode) => plainText(doc).trim() === "" && mediaKeysOf(doc).length === 0;

/** Tag: huruf kecil, tanpa '#', hanya huruf/angka/garis bawah. */
export function normalizeTag(raw: string) {
  return raw.trim().replace(/^#+/, "").toLowerCase().replace(/[^\p{L}\p{N}_]+/gu, "").slice(0, 30);
}

export const EMPTY_DOC: BlogNode = { type: "doc", content: [{ type: "paragraph" }] };

/** Tipe yang dipakai bersama oleh server, halaman publik, dan form admin. */
export type BlogAuthor = { name: string; bio: string; photoUrl: string | null };

export type BlogFile = { key: string; url?: string };

export type BlogPostSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover: BlogFile | null;
  tags: string[];
  status: "DRAFT" | "PUBLISHED";
  /** ISO. */
  publishedAt: string | null;
  updatedAt: string;
  author: BlogAuthor;
  likeCount: number;
  commentCount: number;
};

export type BlogPostFull = BlogPostSummary & {
  /** Dokumen dengan `src` media sudah terisi URL baca. */
  content: BlogNode;
  authorUserId: number | null;
  authorPhotoKey: string | null;
};

export type BlogCommentView = { id: string; authorName: string; anonymous: boolean; body: string; createdAt: string };

export type BlogUploadPurpose = "cover" | "author" | "image" | "video" | "audio";

const MB = 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const AUDIO_TYPES = ["audio/mpeg", "audio/mp4", "audio/aac", "audio/wav", "audio/webm", "audio/ogg", "audio/x-m4a", "audio/m4a"];

export const BLOG_UPLOAD_RULES: Record<
  BlogUploadPurpose,
  { accept: string; maxBytes: number; maxLabel: string; allows: (mime: string) => boolean; formats: string }
> = {
  cover: { accept: IMAGE_TYPES.join(","), maxBytes: 8 * MB, maxLabel: "8 MB", allows: (m) => IMAGE_TYPES.includes(m), formats: "JPG, PNG, WebP, atau GIF" },
  author: { accept: IMAGE_TYPES.join(","), maxBytes: 5 * MB, maxLabel: "5 MB", allows: (m) => IMAGE_TYPES.includes(m), formats: "JPG, PNG, WebP, atau GIF" },
  image: { accept: IMAGE_TYPES.join(","), maxBytes: 10 * MB, maxLabel: "10 MB", allows: (m) => IMAGE_TYPES.includes(m), formats: "JPG, PNG, WebP, atau GIF" },
  video: { accept: "video/mp4,video/webm,video/quicktime", maxBytes: 500 * MB, maxLabel: "500 MB", allows: (m) => m.startsWith("video/"), formats: "video (MP4, MOV, WebM)" },
  audio: { accept: AUDIO_TYPES.join(","), maxBytes: 100 * MB, maxLabel: "100 MB", allows: (m) => AUDIO_TYPES.includes(m) || m.startsWith("audio/"), formats: "audio (MP3, M4A, WAV, OGG)" },
};
