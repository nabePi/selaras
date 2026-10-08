"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { BLOG_UPLOAD_RULES, EMPTY_DOC, isDocEmpty, normalizeTag, type BlogCommentView, type BlogNode, type BlogPostFull, type BlogUploadPurpose } from "@/lib/blog-content";
import { deleteBlogComment, saveBlogPost } from "@/lib/admin-actions";
import { uploadBlogFile } from "@/lib/blog-upload";
import { fieldClass, FieldLabel } from "../dialog";
import { Icon } from "../icon";
import { useToast } from "../toast-provider";
import { BlogEditor } from "./blog-editor";
import { btnPrimary, btnSoft } from "./page-header";

const INPUT = `${fieldClass} border border-outline-variant focus-visible:border-sage-medium`;

type Picked = { key: string; url?: string } | null;
type Errors = { title?: string; content?: string; authorName?: string; form?: string };

const errorText = (msg?: string) =>
  msg && (
    <p role="alert" className="t-body-sm text-error">
      {msg}
    </p>
  );

/** Satu gambar (sampul atau foto penulis) dengan pratinjau dan progres unggah. */
function ImageField({ purpose, value, onChange, onBusy, label, aspect }: { purpose: BlogUploadPurpose; value: Picked; onChange: (v: Picked) => void; onBusy: (d: 1 | -1) => void; label: string; aspect: string }) {
  const { showToast } = useToast();
  const ref = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);

  async function pick(file: File | undefined) {
    if (ref.current) ref.current.value = "";
    if (!file) return;
    setProgress(0);
    onBusy(1);
    const res = await uploadBlogFile(file, purpose, setProgress);
    onBusy(-1);
    setProgress(null);
    if (!res.ok) return showToast(res.error);
    onChange({ key: res.key, url: res.url });
  }

  return (
    <div className="flex items-end gap-3">
      <div className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-canvas-sand text-text-muted ${aspect}`}>
        {value?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value.url} alt="" className="size-full object-cover" />
        ) : (
          <Icon name="image" size={28} />
        )}
      </div>
      <div className="flex flex-col items-start gap-2">
        <input ref={ref} type="file" accept={BLOG_UPLOAD_RULES[purpose].accept} className="hidden" onChange={(e) => void pick(e.target.files?.[0])} />
        <button type="button" disabled={progress !== null} onClick={() => ref.current?.click()} className="t-label-md flex items-center gap-2 rounded-full bg-canvas-cream px-4 py-2 text-on-surface shadow-sm hover:bg-surface-container-low disabled:opacity-60">
          <Icon name="upload" size={16} />
          {progress !== null ? `Mengunggah ${progress}%` : value ? `Ganti ${label}` : `Unggah ${label}`}
        </button>
        {value && (
          <button type="button" onClick={() => onChange(null)} className="t-label-sm text-error hover:underline">
            Hapus {label}
          </button>
        )}
      </div>
    </div>
  );
}

function TagsField({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [draft, setDraft] = useState("");
  function commit(raw: string) {
    const added = raw.split(/[,\s]+/).map(normalizeTag).filter(Boolean);
    if (added.length) onChange([...new Set([...tags, ...added])].slice(0, 10));
    setDraft("");
  }
  return (
    <div className="space-y-2">
      {tags.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <li key={t} className="t-label-md flex items-center gap-1 rounded-full bg-sage-tint py-1 pr-1.5 pl-3 text-primary">
              #{t}
              <button type="button" aria-label={`Hapus #${t}`} onClick={() => onChange(tags.filter((x) => x !== t))} className="rounded-full p-0.5 hover:bg-primary-fixed">
                <Icon name="close" size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <input
        id="blog-tags"
        value={draft}
        maxLength={60}
        onChange={(e) => (/[,\s]$/.test(e.target.value) ? commit(e.target.value) : setDraft(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit(draft);
          } else if (e.key === "Backspace" && !draft && tags.length) onChange(tags.slice(0, -1));
        }}
        onBlur={() => commit(draft)}
        placeholder="Ketik hashtag lalu tekan Enter atau koma, cth: pernikahan"
        className={INPUT}
      />
    </div>
  );
}

function CommentModeration({ comments }: { comments: BlogCommentView[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  async function remove(id: string) {
    if (!window.confirm("Hapus komentar ini?")) return;
    const res = await deleteBlogComment(id);
    if (!res.ok) return showToast(res.error);
    router.refresh();
  }
  return (
    <section className="space-y-3 rounded-3xl bg-canvas-ivory p-6 shadow-sm">
      <h2 className="t-title-md text-on-surface">Komentar ({comments.length})</h2>
      {comments.length === 0 ? (
        <p className="t-body-md text-text-muted">Belum ada komentar.</p>
      ) : (
        <ul className="space-y-2">
          {comments.map((c) => (
            <li key={c.id} className="flex items-start gap-3 rounded-2xl bg-surface-container-low px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="t-label-md text-on-surface">
                  {c.authorName}
                  <span className="t-label-sm ml-2 font-normal text-text-muted">{new Date(c.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</span>
                </p>
                <p className="t-body-sm whitespace-pre-line break-words text-on-surface">{c.body}</p>
              </div>
              <button type="button" aria-label="Hapus komentar" onClick={() => void remove(c.id)} className="rounded-full p-1.5 text-text-muted hover:bg-surface-container hover:text-error">
                <Icon name="delete" size={18} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Tulis artikel baru, atau ubah artikel yang sudah ada bila `initial` diberikan. */
export function BlogForm({ initial, account, comments = [] }: { initial?: BlogPostFull; account: { name: string; photoUrl: string | null }; comments?: BlogCommentView[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [cover, setCover] = useState<Picked>(initial?.cover ?? null);
  const [content, setContent] = useState<BlogNode>(initial?.content ?? EMPTY_DOC);
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [authorMode, setAuthorMode] = useState<"account" | "manual">(initial ? (initial.authorUserId ? "account" : "manual") : "account");
  const [authorName, setAuthorName] = useState(initial?.author.name ?? account.name);
  const [authorBio, setAuthorBio] = useState(initial?.author.bio ?? "");
  // Foto penulis tersimpan sebagai key bila dari blog, atau milik akun; keduanya tampil lewat URL.
  const [authorPhoto, setAuthorPhoto] = useState<Picked>(initial?.authorPhotoKey?.startsWith("blog/") && initial.author.photoUrl ? { key: initial.authorPhotoKey, url: initial.author.photoUrl } : null);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(0);
  const [saving, setSaving] = useState(false);

  const status = initial?.status ?? "DRAFT";
  const photoPreview = authorPhoto ?? (authorMode === "account" && account.photoUrl ? { key: "", url: account.photoUrl } : initial?.author.photoUrl && !initial.authorPhotoKey?.startsWith("blog/") ? { key: "", url: initial.author.photoUrl } : null);

  function chooseMode(mode: "account" | "manual") {
    setAuthorMode(mode);
    if (mode === "account" && !authorName.trim()) setAuthorName(account.name);
  }

  async function submit(target: "DRAFT" | "PUBLISHED") {
    if (saving || busy) return;
    const next: Errors = {};
    if (title.trim().length < 3) next.title = "Judul artikel minimal 3 karakter.";
    if (target === "PUBLISHED" && isDocEmpty(content)) next.content = "Isi artikel masih kosong.";
    if (authorMode === "manual" && !authorName.trim()) next.authorName = "Nama penulis wajib diisi.";
    setErrors(next);
    if (Object.keys(next).length) return showToast(Object.values(next)[0]!);

    setSaving(true);
    const res = await saveBlogPost(
      {
        title,
        excerpt,
        cover: cover ? { key: cover.key } : null,
        content,
        tags,
        status: target,
        authorMode,
        authorName,
        authorBio,
        authorPhoto: authorPhoto ? { key: authorPhoto.key } : null,
      },
      initial?.id,
    );
    setSaving(false);
    if (!res.ok) {
      if (res.fields) setErrors({ ...res.fields });
      return showToast(res.error);
    }
    showToast(target === "PUBLISHED" ? "Artikel diterbitkan." : "Draf disimpan.", { tone: "success" });
    router.push("/admin/blog");
    router.refresh();
  }

  const onBusy = (d: 1 | -1) => setBusy((n) => n + d);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8 sm:px-8 lg:p-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="t-label-sm inline-flex items-center gap-1.5 rounded-full bg-sage-tint px-3 py-1 tracking-wide text-primary">{initial ? "Edit Artikel" : "Artikel Baru"}</span>
        <Link href="/admin/blog" className={btnSoft}>
          <Icon name="arrow_back" size={18} />
          <span>Kembali ke Daftar</span>
        </Link>
      </div>

      <form onSubmit={(e) => e.preventDefault()} noValidate className="space-y-6">
        <section className="space-y-4 rounded-3xl bg-canvas-ivory p-6 shadow-sm">
          <div className="space-y-1">
            <FieldLabel htmlFor="blog-title">Judul artikel</FieldLabel>
            <input id="blog-title" value={title} maxLength={160} onChange={(e) => setTitle(e.target.value)} placeholder="cth: 5 Tanda Pernikahan yang Sehat" className={`${INPUT} ${errors.title ? "ring-2 ring-error" : ""}`} />
            {errorText(errors.title)}
          </div>
          <div className="space-y-1">
            <FieldLabel htmlFor="blog-excerpt">Ringkasan (opsional, kosong = otomatis dari isi)</FieldLabel>
            <textarea id="blog-excerpt" value={excerpt} maxLength={300} rows={2} onChange={(e) => setExcerpt(e.target.value)} className={`${INPUT} py-3`} />
          </div>
          <div className="space-y-1">
            <p className="t-label-sm font-normal text-text-muted">Gambar sampul</p>
            <ImageField purpose="cover" label="sampul" value={cover} onChange={setCover} onBusy={onBusy} aspect="aspect-[16/9] w-40" />
          </div>
        </section>

        <section className="space-y-2 rounded-3xl bg-canvas-ivory p-6 shadow-sm">
          <h2 className="t-title-md text-on-surface">Isi Artikel</h2>
          <p className="t-body-sm text-text-muted">Gunakan toolbar untuk memformat tulisan dan menyisipkan gambar, video, atau audio.</p>
          <BlogEditor initial={content} onChange={setContent} onBusy={onBusy} invalid={!!errors.content} />
          {errorText(errors.content)}
        </section>

        <section className="space-y-3 rounded-3xl bg-canvas-ivory p-6 shadow-sm">
          <FieldLabel htmlFor="blog-tags">Hashtag</FieldLabel>
          <TagsField tags={tags} onChange={setTags} />
        </section>

        <section className="space-y-4 rounded-3xl bg-canvas-ivory p-6 shadow-sm">
          <h2 className="t-title-md text-on-surface">Penulis</h2>
          <div role="radiogroup" aria-label="Sumber penulis" className="flex flex-wrap gap-2">
            {(
              [
                ["account", `Akun saya (${account.name})`],
                ["manual", "Isi manual"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={authorMode === value}
                onClick={() => chooseMode(value)}
                className={`t-label-md rounded-full border px-4 py-1.5 transition-colors ${authorMode === value ? "border-primary bg-primary text-on-primary" : "border-outline-variant bg-surface text-on-surface hover:bg-surface-container-low"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="space-y-1">
            <FieldLabel htmlFor="blog-author">Nama penulis</FieldLabel>
            <input id="blog-author" value={authorName} maxLength={120} onChange={(e) => setAuthorName(e.target.value)} className={`${INPUT} ${errors.authorName ? "ring-2 ring-error" : ""}`} />
            {errorText(errors.authorName)}
          </div>
          <div className="space-y-1">
            <FieldLabel htmlFor="blog-bio">Keterangan penulis</FieldLabel>
            <textarea id="blog-bio" value={authorBio} maxLength={500} rows={3} onChange={(e) => setAuthorBio(e.target.value)} placeholder="Latar belakang singkat penulis" className={`${INPUT} py-3`} />
          </div>
          <div className="space-y-1">
            <p className="t-label-sm font-normal text-text-muted">Foto penulis{authorMode === "account" ? " (kosong = foto akun)" : ""}</p>
            <ImageField purpose="author" label="foto" value={authorPhoto ?? photoPreview} onChange={setAuthorPhoto} onBusy={onBusy} aspect="size-20" />
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-end gap-3">
          {initial?.status === "PUBLISHED" && (
            <Link href={`/blog/${initial.slug}`} target="_blank" className={btnSoft}>
              <Icon name="open_in_new" size={18} />
              <span>Lihat</span>
            </Link>
          )}
          <button type="button" disabled={saving || busy > 0} onClick={() => void submit("DRAFT")} className={btnSoft}>
            {status === "PUBLISHED" ? "Jadikan Draf" : "Simpan Draf"}
          </button>
          <button type="button" disabled={saving || busy > 0} onClick={() => void submit("PUBLISHED")} className={btnPrimary}>
            <Icon name="publish" size={18} />
            <span>{saving ? "Menyimpan…" : status === "PUBLISHED" ? "Perbarui" : "Terbitkan"}</span>
          </button>
        </div>
      </form>

      {initial && <CommentModeration comments={comments} />}
    </div>
  );
}
