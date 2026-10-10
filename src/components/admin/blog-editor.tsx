"use client";

import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { EditorContent, Node, mergeAttributes, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useMemo, useRef, useState } from "react";
import { BLOG_UPLOAD_RULES, type BlogNode, type BlogUploadPurpose } from "@/lib/blog-content";
import { uploadBlogFile } from "@/lib/blog-upload";
import { Icon } from "../icon";
import { useToast } from "../toast-provider";

const keyAttr = {
  default: null,
  parseHTML: (el: HTMLElement) => el.getAttribute("data-key"),
  renderHTML: (attrs: { key?: string | null }) => (attrs.key ? { "data-key": attrs.key } : {}),
};

const BlogImage = Image.extend({
  addAttributes() {
    return { ...this.parent?.(), key: keyAttr };
  },
});

/** Node blok video/audio: `key` menunjuk objek R2, `src` hanya URL sementara untuk pratinjau. */
const mediaNode = (name: "video" | "audio") =>
  Node.create({
    name,
    group: "block",
    atom: true,
    draggable: true,
    addAttributes: () => ({ key: keyAttr, src: { default: null } }),
    parseHTML: () => [{ tag: `${name}[data-key]` }],
    renderHTML: ({ HTMLAttributes }) => [name, mergeAttributes(HTMLAttributes, { controls: "true", preload: "metadata", class: name === "video" ? "w-full rounded-2xl bg-black" : "w-full" })],
  });

const baseExtensions = [
  StarterKit.configure({ heading: { levels: [2, 3] }, link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer nofollow" } } }),
  BlogImage.configure({ HTMLAttributes: { class: "rounded-2xl" } }),
  mediaNode("video"),
  mediaNode("audio"),
  TextAlign.configure({ types: ["heading", "paragraph"] }),
];

function ToolButton({ label, icon, active, disabled, onClick }: { label: string; icon: string; active?: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      // Cegah editor kehilangan fokus/seleksi sebelum perintah dijalankan.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`flex size-9 items-center justify-center rounded-lg transition-colors disabled:opacity-40 ${active ? "bg-primary text-on-primary" : "text-on-surface hover:bg-surface-container-high"}`}
    >
      <Icon name={icon} size={20} />
    </button>
  );
}

const Divider = () => <span aria-hidden="true" className="mx-1 h-6 w-px bg-outline-variant" />;

function Toolbar({ editor, onBusy, media }: { editor: Editor; onBusy: (d: 1 | -1) => void; media: boolean }) {
  const { showToast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<BlogUploadPurpose>("image");
  const [progress, setProgress] = useState<number | null>(null);

  // Status tombol (aktif/nonaktif) mengikuti seleksi tanpa merender ulang seluruh form.
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      strike: e.isActive("strike"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      link: e.isActive("link"),
      left: e.isActive({ textAlign: "left" }),
      center: e.isActive({ textAlign: "center" }),
      right: e.isActive({ textAlign: "right" }),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });
  const run = () => editor.chain().focus();

  function setLink() {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Alamat tautan (https://…). Kosongkan untuk menghapus.", prev ?? "https://");
    if (url === null) return;
    if (!url.trim()) return void run().extendMarkRange("link").unsetLink().run();
    if (!/^(https?:|mailto:)/i.test(url.trim())) return showToast("Tautan harus diawali https://");
    run().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }

  function choose(purpose: BlogUploadPurpose) {
    setPending(purpose);
    // Beri waktu state `accept` terpasang sebelum dialog berkas dibuka.
    setTimeout(() => fileRef.current?.click(), 0);
  }

  async function onFile(file: File | undefined) {
    if (fileRef.current) fileRef.current.value = "";
    if (!file) return;
    const purpose = pending;
    setProgress(0);
    onBusy(1);
    const res = await uploadBlogFile(file, purpose, setProgress);
    onBusy(-1);
    setProgress(null);
    if (!res.ok) return showToast(res.error);
    const type = purpose === "image" ? "image" : purpose;
    run()
      .insertContent({ type, attrs: type === "image" ? { key: res.key, src: res.url, alt: file.name.replace(/\.[^.]+$/, "") } : { key: res.key, src: res.url } })
      .run();
  }

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 rounded-t-2xl border-b border-outline-variant bg-surface-container-low p-1.5">
      <ToolButton label="Tebal" icon="format_bold" active={s.bold} onClick={() => run().toggleBold().run()} />
      <ToolButton label="Miring" icon="format_italic" active={s.italic} onClick={() => run().toggleItalic().run()} />
      <ToolButton label="Garis bawah" icon="format_underlined" active={s.underline} onClick={() => run().toggleUnderline().run()} />
      <ToolButton label="Coret" icon="format_strikethrough" active={s.strike} onClick={() => run().toggleStrike().run()} />
      <Divider />
      <ToolButton label="Judul besar" icon="looks_two" active={s.h2} onClick={() => run().toggleHeading({ level: 2 }).run()} />
      <ToolButton label="Judul kecil" icon="looks_3" active={s.h3} onClick={() => run().toggleHeading({ level: 3 }).run()} />
      <ToolButton label="Daftar poin" icon="format_list_bulleted" active={s.bullet} onClick={() => run().toggleBulletList().run()} />
      <ToolButton label="Daftar angka" icon="format_list_numbered" active={s.ordered} onClick={() => run().toggleOrderedList().run()} />
      <ToolButton label="Kutipan" icon="format_quote" active={s.quote} onClick={() => run().toggleBlockquote().run()} />
      <ToolButton label="Garis pemisah" icon="horizontal_rule" onClick={() => run().setHorizontalRule().run()} />
      <Divider />
      <ToolButton label="Rata kiri" icon="format_align_left" active={s.left} onClick={() => run().setTextAlign("left").run()} />
      <ToolButton label="Rata tengah" icon="format_align_center" active={s.center} onClick={() => run().setTextAlign("center").run()} />
      <ToolButton label="Rata kanan" icon="format_align_right" active={s.right} onClick={() => run().setTextAlign("right").run()} />
      <Divider />
      <ToolButton label="Tautan" icon="link" active={s.link} onClick={setLink} />
      {media && (
        <>
          <ToolButton label="Sisipkan gambar" icon="image" disabled={progress !== null} onClick={() => choose("image")} />
          <ToolButton label="Sisipkan video" icon="videocam" disabled={progress !== null} onClick={() => choose("video")} />
          <ToolButton label="Sisipkan audio" icon="mic" disabled={progress !== null} onClick={() => choose("audio")} />
        </>
      )}
      <Divider />
      <ToolButton label="Urungkan" icon="undo" disabled={!s.canUndo} onClick={() => run().undo().run()} />
      <ToolButton label="Ulangi" icon="redo" disabled={!s.canRedo} onClick={() => run().redo().run()} />
      {progress !== null && <span className="t-label-sm ml-2 text-text-muted tabular-nums">Mengunggah {progress}%</span>}
      <input ref={fileRef} type="file" accept={BLOG_UPLOAD_RULES[pending].accept} className="hidden" onChange={(e) => void onFile(e.target.files?.[0])} />
    </div>
  );
}

/** Editor WYSIWYG artikel (Tiptap). Isi disimpan sebagai dokumen JSON; media dirujuk lewat key R2. */
export function BlogEditor({
  initial,
  onChange,
  onBusy,
  invalid,
  media = true,
  label = "Isi artikel",
  placeholder = "Mulai menulis artikel…",
}: {
  initial: BlogNode;
  onChange: (doc: BlogNode) => void;
  onBusy: (d: 1 | -1) => void;
  invalid?: boolean;
  /** False menyembunyikan tombol gambar/video/audio (mis. untuk pesan yang lampirannya terpisah). */
  media?: boolean;
  label?: string;
  placeholder?: string;
}) {
  const extensions = useMemo(() => [...baseExtensions, Placeholder.configure({ placeholder })], [placeholder]);
  const editor = useEditor({
    extensions,
    content: initial,
    // Next merender komponen client di server dulu; tanpa ini editor memicu ketidakcocokan hidrasi.
    immediatelyRender: false,
    onUpdate: ({ editor: e }) => onChange(e.getJSON() as BlogNode),
    editorProps: {
      attributes: {
        "aria-label": label,
        class: "blog-editor t-body-lg min-h-[360px] px-4 py-3 text-on-surface focus:outline-none",
      },
    },
  });

  return (
    <div className={`rounded-2xl border bg-surface ${invalid ? "border-error ring-2 ring-error" : "border-outline-variant"}`}>
      {editor ? <Toolbar editor={editor} onBusy={onBusy} media={media} /> : <div className="h-12 rounded-t-2xl bg-surface-container-low" />}
      <EditorContent editor={editor} />
    </div>
  );
}
