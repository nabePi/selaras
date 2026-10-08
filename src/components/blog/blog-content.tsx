import Link from "next/link";
import type { BlogMark, BlogNode } from "@/lib/blog-content";

const ALIGN = { left: "text-left", center: "text-center", right: "text-right" } as const;
const alignOf = (n: BlogNode) => ALIGN[(n.attrs?.textAlign as keyof typeof ALIGN) ?? "left"] ?? "";

function applyMarks(text: string, marks: BlogMark[] | undefined, key: number): React.ReactNode {
  let out: React.ReactNode = text;
  for (const m of marks ?? []) {
    switch (m.type) {
      case "bold":
        out = <strong>{out}</strong>;
        break;
      case "italic":
        out = <em>{out}</em>;
        break;
      case "underline":
        out = <u>{out}</u>;
        break;
      case "strike":
        out = <s>{out}</s>;
        break;
      case "code":
        out = <code className="rounded bg-surface-container px-1 py-0.5 text-[0.9em]">{out}</code>;
        break;
      case "link":
        out = (
          <a href={m.attrs?.href} target="_blank" rel="noopener noreferrer nofollow" className="text-primary underline underline-offset-2">
            {out}
          </a>
        );
        break;
    }
  }
  return <span key={key}>{out}</span>;
}

function render(nodes: BlogNode[] | undefined): React.ReactNode {
  return nodes?.map((n, i) => {
    switch (n.type) {
      case "text":
        return applyMarks(n.text ?? "", n.marks, i);
      case "hardBreak":
        return <br key={i} />;
      case "paragraph":
        return (
          <p key={i} className={`${alignOf(n)} min-h-[1.5em]`}>
            {render(n.content)}
          </p>
        );
      case "heading":
        return n.attrs?.level === 3 ? (
          <h3 key={i} className={`${alignOf(n)} t-title-md mt-3 text-on-surface`}>
            {render(n.content)}
          </h3>
        ) : (
          <h2 key={i} className={`${alignOf(n)} t-headline-sm mt-4 text-on-surface`}>
            {render(n.content)}
          </h2>
        );
      case "bulletList":
        return (
          <ul key={i} className="list-disc space-y-1 pl-6">
            {render(n.content)}
          </ul>
        );
      case "orderedList":
        return (
          <ol key={i} start={Number(n.attrs?.start) || 1} className="list-decimal space-y-1 pl-6">
            {render(n.content)}
          </ol>
        );
      case "listItem":
        return (
          <li key={i} className="[&>p]:min-h-0">
            {render(n.content)}
          </li>
        );
      case "blockquote":
        return (
          <blockquote key={i} className="border-l-4 border-primary/40 pl-4 text-on-surface-variant italic">
            {render(n.content)}
          </blockquote>
        );
      case "codeBlock":
        return (
          <pre key={i} className="overflow-x-auto rounded-2xl bg-surface-container p-4 text-sm">
            <code>{render(n.content)}</code>
          </pre>
        );
      case "horizontalRule":
        return <hr key={i} className="my-4 border-outline-variant" />;
      case "image":
        return n.attrs?.src ? (
          <figure key={i}>
            {/* URL bertanda tangan R2 berubah tiap render, jadi tidak lewat optimizer next/image. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={String(n.attrs.src)} alt={String(n.attrs.alt ?? "")} loading="lazy" className="w-full rounded-2xl" />
          </figure>
        ) : null;
      case "video":
        return n.attrs?.src ? <video key={i} controls preload="metadata" src={String(n.attrs.src)} className="w-full rounded-2xl bg-black" /> : null;
      case "audio":
        return n.attrs?.src ? <audio key={i} controls preload="metadata" src={String(n.attrs.src)} className="w-full" /> : null;
      default:
        return null;
    }
  });
}

/** Isi artikel (dokumen Tiptap yang sudah di-resolve) sebagai elemen React, bukan HTML mentah. */
export function BlogContent({ doc }: { doc: BlogNode }) {
  return <div className="t-body-lg flex flex-col gap-4 leading-relaxed text-on-surface break-words">{render(doc.content)}</div>;
}

export function TagList({ tags }: { tags: string[] }) {
  if (!tags.length) return null;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {tags.map((t) => (
        <li key={t}>
          <Link href={`/blog?tag=${encodeURIComponent(t)}`} className="t-label-md rounded-full bg-sage-tint px-3 py-1 text-primary transition-colors hover:bg-primary-fixed">
            #{t}
          </Link>
        </li>
      ))}
    </ul>
  );
}
