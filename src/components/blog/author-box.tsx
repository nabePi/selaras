import type { BlogAuthor } from "@/lib/blog-content";
import { Icon } from "../icon";

export function AuthorAvatar({ author, size = 40 }: { author: BlogAuthor; size?: number }) {
  return author.photoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={author.photoUrl} alt={author.name} width={size} height={size} className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />
  ) : (
    <span className="flex shrink-0 items-center justify-center rounded-full bg-sage-tint text-primary" style={{ width: size, height: size }}>
      <Icon name="person" size={size * 0.55} />
    </span>
  );
}

/** Kartu penulis di akhir artikel: foto, nama, dan keterangan. */
export function AuthorBox({ author }: { author: BlogAuthor }) {
  return (
    <aside aria-label="Tentang penulis" className="flex items-start gap-3 rounded-3xl bg-surface-container-low p-4">
      <AuthorAvatar author={author} size={56} />
      <div className="min-w-0">
        <p className="t-label-sm tracking-wide text-text-muted uppercase">Ditulis oleh</p>
        <p className="t-title-md text-on-surface">{author.name}</p>
        {author.bio && <p className="t-body-sm whitespace-pre-line text-text-muted">{author.bio}</p>}
      </div>
    </aside>
  );
}
