import "server-only";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import {
  BLOG_KEY_PREFIX,
  BLOG_UPLOAD_RULES,
  InvalidDocError,
  isDocEmpty,
  isMediaNode,
  mediaKeysOf,
  normalizeTag,
  plainText,
  sanitizeDoc,
  type BlogCommentView,
  type BlogFile,
  type BlogNode,
  type BlogPostFull,
  type BlogPostSummary,
  type BlogUploadPurpose,
  type MediaType,
} from "@/lib/blog-content";
import { db } from "@/lib/db";
import { ApiError, notFound } from "@/lib/server/errors";
import { deleteObjects, headObject, presignRead, presignUpload, r2Configured } from "@/lib/server/r2";
import type { SessionUser } from "@/lib/server/session";
import { avatarSrc } from "@/server/avatar";

const PURPOSES = ["cover", "author", "image", "video", "audio"] as const;
const prefixFor = (purpose: BlogUploadPurpose) => `${BLOG_KEY_PREFIX}${purpose}/`;

const presignSchema = z.object({
  purpose: z.enum(PURPOSES),
  name: z.string().trim().min(1).max(200),
  type: z.string().max(150),
  size: z.number().int().positive(),
});

/** URL unggah (PUT langsung dari peramban ke R2) untuk berkas blog. */
export async function createBlogUploadUrl(body: unknown) {
  const { purpose, name, type, size } = presignSchema.parse(body);
  const rule = BLOG_UPLOAD_RULES[purpose];
  if (!rule.allows(type)) throw new ApiError(400, `${name}: format tidak didukung (gunakan ${rule.formats}).`);
  if (size > rule.maxBytes) throw new ApiError(400, `${name}: melebihi batas ${rule.maxLabel}.`);
  if (!r2Configured()) throw new ApiError(503, "Penyimpanan berkas belum dikonfigurasi.");
  const safe = name.replace(/[^\w.-]+/g, "_").slice(-80);
  const key = `${prefixFor(purpose)}${randomUUID()}-${safe}`;
  return { key, uploadUrl: await presignUpload(key, type) };
}

const fileSchema = z.object({ key: z.string().min(1).max(500) });

export const postSchema = z.object({
  title: z.string().trim().min(3, "Judul artikel minimal 3 karakter.").max(160),
  excerpt: z.string().trim().max(300).default(""),
  cover: fileSchema.nullable().default(null),
  content: z.unknown(),
  tags: z.array(z.string().max(60)).max(10, "Maksimal 10 hashtag.").default([]),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  authorMode: z.enum(["account", "manual"]).default("account"),
  authorName: z.string().trim().max(120).default(""),
  authorBio: z.string().trim().max(500).default(""),
  authorPhoto: fileSchema.nullable().default(null),
});
export type PostInput = z.output<typeof postSchema>;

function slugify(title: string) {
  const base = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
  return base || "artikel";
}

async function uniqueSlug(title: string) {
  const base = slugify(title);
  for (let i = 0; i < 20; i++) {
    const slug = i === 0 ? base : `${base}-${i + 1}`;
    if (!(await db.blogPost.findUnique({ where: { slug }, select: { id: true } }))) return slug;
  }
  return `${base}-${randomUUID().slice(0, 8)}`;
}

async function readUrl(key: string | null | undefined) {
  return key && r2Configured() ? presignRead(key) : undefined;
}

/** Salinan dokumen dengan atribut `src` media diisi URL baca bertanda tangan. */
export async function resolveDoc(doc: BlogNode): Promise<BlogNode> {
  const walk = async (n: BlogNode): Promise<BlogNode> => {
    if (isMediaNode(n.type) && typeof n.attrs?.key === "string") {
      return { ...n, attrs: { ...n.attrs, src: (await readUrl(n.attrs.key)) ?? null } };
    }
    if (!n.content) return n;
    return { ...n, content: await Promise.all(n.content.map(walk)) };
  };
  return walk(doc);
}

const summarySelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  coverKey: true,
  tags: true,
  status: true,
  publishedAt: true,
  updatedAt: true,
  authorName: true,
  authorBio: true,
  authorPhoto: true,
  _count: { select: { likes: true, comments: true } },
} satisfies Prisma.BlogPostSelect;
type SummaryRow = Prisma.BlogPostGetPayload<{ select: typeof summarySelect }>;

async function toSummary(row: SummaryRow): Promise<BlogPostSummary> {
  return {
    id: String(row.id),
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    cover: row.coverKey ? { key: row.coverKey, url: await readUrl(row.coverKey) } : null,
    tags: row.tags,
    status: row.status,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    updatedAt: row.updatedAt.toISOString(),
    author: { name: row.authorName, bio: row.authorBio, photoUrl: (await avatarSrc(row.authorPhoto)) ?? null },
    likeCount: row._count.likes,
    commentCount: row._count.comments,
  };
}

async function toFull(row: SummaryRow & { content: Prisma.JsonValue; authorUserId: number | null }): Promise<BlogPostFull> {
  return {
    ...(await toSummary(row)),
    content: await resolveDoc(row.content as unknown as BlogNode),
    authorUserId: row.authorUserId,
    authorPhotoKey: row.authorPhoto,
  };
}

const fullSelect = { ...summarySelect, content: true, authorUserId: true } satisfies Prisma.BlogPostSelect;

function parseId(id: string) {
  const n = Number(id);
  if (!Number.isSafeInteger(n) || n <= 0) throw notFound("Artikel");
  return n;
}

/** Kunci R2 milik blog yang dipakai sebuah artikel (sampul, foto penulis buatan blog, media isi). */
function keysOf(p: { coverKey: string | null; authorPhoto: string | null; content: unknown }) {
  return [p.coverKey, p.authorPhoto, ...mediaKeysOf(p.content as BlogNode)].filter(
    (k): k is string => !!k && k.startsWith(BLOG_KEY_PREFIX),
  );
}

/** Berkas baru harus berawalan sesuai jenisnya, sudah ada di R2, dan sesuai batas. */
async function verifyKey(key: string, purpose: BlogUploadPurpose, known: Set<string>) {
  if (known.has(key)) return;
  if (!key.startsWith(prefixFor(purpose)) || key.includes("..")) throw new ApiError(403, "Akses ditolak.");
  const rule = BLOG_UPLOAD_RULES[purpose];
  const head = await headObject(key);
  if (!head || !rule.allows(head.contentType)) throw new ApiError(400, "Berkas belum terunggah atau formatnya tidak didukung.");
  if (head.size > rule.maxBytes) {
    await deleteObjects([key]);
    throw new ApiError(400, `Berkas melebihi batas ${rule.maxLabel}.`);
  }
}

function cleanContent(raw: unknown): BlogNode {
  try {
    return sanitizeDoc(raw);
  } catch (e) {
    if (e instanceof InvalidDocError) throw new ApiError(400, e.message, { content: e.message });
    throw e;
  }
}

async function buildData(input: PostInput, admin: SessionUser, known: Set<string>) {
  const content = cleanContent(input.content);
  if (input.status === "PUBLISHED" && isDocEmpty(content)) throw new ApiError(400, "Isi artikel masih kosong.", { content: "Isi artikel masih kosong." });

  if (input.cover) await verifyKey(input.cover.key, "cover", known);
  const nodes: { type: MediaType; key: string }[] = [];
  const collect = (n: BlogNode) => {
    if (isMediaNode(n.type) && typeof n.attrs?.key === "string") nodes.push({ type: n.type, key: n.attrs.key });
    n.content?.forEach(collect);
  };
  collect(content);
  for (const m of new Set(nodes.map((n) => `${n.type}|${n.key}`))) {
    const [type, key] = m.split("|");
    await verifyKey(key, type as MediaType, known);
  }

  const tags = [...new Set(input.tags.map(normalizeTag).filter(Boolean))];
  const excerpt = input.excerpt || plainText(content).replace(/\s+/g, " ").trim().slice(0, 180);

  let authorUserId: number | null = null;
  let authorName = input.authorName;
  let authorPhoto: string | null = null;
  if (input.authorMode === "account") {
    const me = await db.user.findUnique({ where: { id: admin.id }, select: { name: true, avatarUrl: true } });
    authorUserId = admin.id;
    authorName = authorName || me?.name || admin.name;
    authorPhoto = input.authorPhoto?.key ?? me?.avatarUrl ?? null;
  } else {
    if (!authorName) throw new ApiError(400, "Nama penulis wajib diisi.", { authorName: "Nama penulis wajib diisi." });
    authorPhoto = input.authorPhoto?.key ?? null;
  }
  if (authorPhoto?.startsWith(BLOG_KEY_PREFIX)) await verifyKey(authorPhoto, "author", known);

  return {
    title: input.title,
    excerpt,
    coverKey: input.cover?.key ?? null,
    content: content as unknown as Prisma.InputJsonValue,
    tags,
    status: input.status,
    authorUserId,
    authorName,
    authorBio: input.authorBio,
    authorPhoto,
  };
}

export async function createPost(input: PostInput, admin: SessionUser): Promise<BlogPostFull> {
  const data = await buildData(input, admin, new Set());
  const row = await db.blogPost.create({
    data: { ...data, slug: await uniqueSlug(input.title), publishedAt: data.status === "PUBLISHED" ? new Date() : null },
    select: fullSelect,
  });
  return toFull(row);
}

export async function updatePost(id: string, input: PostInput, admin: SessionUser): Promise<BlogPostFull> {
  const n = parseId(id);
  const existing = await db.blogPost.findUnique({
    where: { id: n },
    select: { coverKey: true, authorPhoto: true, content: true, publishedAt: true },
  });
  if (!existing) throw notFound("Artikel");
  const oldKeys = keysOf(existing);
  const data = await buildData(input, admin, new Set(oldKeys));
  const row = await db.blogPost.update({
    where: { id: n },
    data: { ...data, publishedAt: data.status === "PUBLISHED" ? (existing.publishedAt ?? new Date()) : existing.publishedAt },
    select: fullSelect,
  });
  const kept = new Set(keysOf({ coverKey: row.coverKey, authorPhoto: row.authorPhoto, content: row.content }));
  await deleteObjects(oldKeys.filter((k) => !kept.has(k)));
  return toFull(row);
}

export async function deletePost(id: string) {
  const n = parseId(id);
  const existing = await db.blogPost.findUnique({ where: { id: n }, select: { coverKey: true, authorPhoto: true, content: true } });
  if (!existing) throw notFound("Artikel");
  await db.blogPost.delete({ where: { id: n } });
  const keys = keysOf(existing);
  await deleteObjects(keys);
  return { deletedFiles: keys.length };
}

export async function listAdminPosts(): Promise<BlogPostSummary[]> {
  const rows = await db.blogPost.findMany({ select: summarySelect, orderBy: { createdAt: "desc" } });
  return Promise.all(rows.map(toSummary));
}

export async function getAdminPost(id: string): Promise<BlogPostFull | null> {
  const n = Number(id);
  if (!Number.isSafeInteger(n) || n <= 0) return null;
  const row = await db.blogPost.findUnique({ where: { id: n }, select: fullSelect });
  return row ? toFull(row) : null;
}

/** Foto & nama akun admin, untuk mengisi penulis otomatis di form. */
export async function getAccountAuthor(userId: number) {
  const me = await db.user.findUnique({ where: { id: userId }, select: { name: true, avatarUrl: true } });
  return { name: me?.name ?? "", photoUrl: (await avatarSrc(me?.avatarUrl)) ?? null };
}

// ---- Publik ----

const PAGE_SIZE = 9;
const published = { status: "PUBLISHED" } as const satisfies Prisma.BlogPostWhereInput;

export async function listPublishedPosts(opts: { tag?: string; page?: number } = {}) {
  const page = Math.max(1, Math.floor(opts.page ?? 1));
  const where: Prisma.BlogPostWhereInput = { ...published, ...(opts.tag ? { tags: { has: opts.tag } } : {}) };
  const [rows, total] = await Promise.all([
    db.blogPost.findMany({ where, select: summarySelect, orderBy: { publishedAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    db.blogPost.count({ where }),
  ]);
  return { posts: await Promise.all(rows.map(toSummary)), page, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getPublishedPost(slug: string): Promise<BlogPostFull | null> {
  const row = await db.blogPost.findFirst({ where: { slug, ...published }, select: fullSelect });
  return row ? toFull(row) : null;
}

/** Artikel terbit lain untuk rekomendasi: yang hashtag-nya paling banyak sama dulu, lalu yang terbaru. */
export async function listRelatedPosts(postId: number, tags: string[], limit = 3): Promise<BlogPostSummary[]> {
  const rows = await db.blogPost.findMany({
    where: { ...published, id: { not: postId } },
    select: summarySelect,
    orderBy: { publishedAt: "desc" },
    take: 30,
  });
  const shared = (t: string[]) => t.filter((x) => tags.includes(x)).length;
  const picked = rows
    .map((r, i) => ({ r, i, n: shared(r.tags) }))
    .sort((a, b) => b.n - a.n || a.i - b.i)
    .slice(0, limit)
    .map((x) => x.r);
  return Promise.all(picked.map(toSummary));
}

export async function listPublishedSlugs() {
  return db.blogPost.findMany({ where: published, select: { slug: true, updatedAt: true }, orderBy: { publishedAt: "desc" } });
}

/** Hashtag yang dipakai artikel terbit, terbanyak dulu. */
export async function listPopularTags(limit = 12) {
  const rows = await db.blogPost.findMany({ where: published, select: { tags: true } });
  const count = new Map<string, number>();
  for (const r of rows) for (const t of r.tags) count.set(t, (count.get(t) ?? 0) + 1);
  return [...count.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, limit).map(([tag]) => tag);
}

export async function likeStateFor(postId: number, actor: string | null) {
  const [count, mine] = await Promise.all([
    db.blogLike.count({ where: { postId } }),
    actor ? db.blogLike.findUnique({ where: { postId_actor: { postId, actor } }, select: { id: true } }) : null,
  ]);
  return { count, liked: !!mine };
}

async function publishedId(slug: string) {
  const post = await db.blogPost.findFirst({ where: { slug, ...published }, select: { id: true } });
  if (!post) throw notFound("Artikel");
  return post.id;
}

export async function toggleLike(slug: string, actor: string) {
  const postId = await publishedId(slug);
  const where = { postId_actor: { postId, actor } };
  if (await db.blogLike.findUnique({ where, select: { id: true } })) await db.blogLike.delete({ where }).catch(() => {});
  else await db.blogLike.create({ data: { postId, actor } }).catch(() => {});
  return likeStateFor(postId, actor);
}

const toComment = (c: { id: number; authorName: string; userId: number | null; body: string; createdAt: Date }): BlogCommentView => ({
  id: String(c.id),
  authorName: c.authorName,
  anonymous: c.userId === null,
  body: c.body,
  createdAt: c.createdAt.toISOString(),
});

const commentSelect = { id: true, authorName: true, userId: true, body: true, createdAt: true } satisfies Prisma.BlogCommentSelect;

export async function listComments(postId: number): Promise<BlogCommentView[]> {
  const rows = await db.blogComment.findMany({ where: { postId }, select: commentSelect, orderBy: { createdAt: "asc" }, take: 200 });
  return rows.map(toComment);
}

export const commentSchema = z.object({
  body: z.string().trim().min(2, "Komentar terlalu pendek.").max(1000, "Komentar maksimal 1000 karakter."),
  captchaToken: z.string().optional(),
  captchaAnswer: z.union([z.string(), z.number()]).optional(),
});

export async function addComment(slug: string, body: string, user: SessionUser | null) {
  const postId = await publishedId(slug);
  const row = await db.blogComment.create({
    data: { postId, body, userId: user?.id ?? null, authorName: user?.name ?? "Anonim" },
    select: commentSelect,
  });
  return toComment(row);
}

export async function listAdminComments(id: string): Promise<BlogCommentView[]> {
  return listComments(parseId(id));
}

export async function deleteComment(commentId: string) {
  const n = Number(commentId);
  if (!Number.isSafeInteger(n) || n <= 0) throw notFound("Komentar");
  await db.blogComment.deleteMany({ where: { id: n } });
}

export type { BlogFile };
