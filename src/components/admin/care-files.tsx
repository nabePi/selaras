import Image from "next/image";
import { formatFileSize } from "@/data/courses";
import type { CareFile } from "@/data/coachee-care";
import { Icon } from "../icon";

/** Lampiran coachee care: gambar, audio, dan video tampil langsung; dokumen berupa tautan unduh. */
export function CareFiles({ files }: { files: CareFile[] }) {
  if (files.length === 0) return null;
  const images = files.filter((f) => f.kind === "image" && f.url);
  const media = files.filter((f) => (f.kind === "audio" || f.kind === "video") && f.url);
  const docs = files.filter((f) => f.kind === "document" || !f.url);

  return (
    <section aria-label="Lampiran" className="space-y-3">
      <h3 className="t-title-sm flex items-center gap-1.5 text-on-surface">
        <Icon name="attach_file" size={18} className="text-primary" />
        Lampiran
        <span className="t-label-sm font-normal text-text-muted">{files.length} berkas</span>
      </h3>

      {images.length > 0 && (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {images.map((f) => (
            <li key={f.key}>
              <a href={f.url} target="_blank" rel="noreferrer" className="relative block aspect-square overflow-hidden rounded-2xl bg-canvas-sand">
                <Image src={f.url!} alt={f.name} fill unoptimized sizes="240px" className="object-cover" />
              </a>
            </li>
          ))}
        </ul>
      )}

      {media.map((f) => (
        <div key={f.key} className="space-y-1">
          <p className="t-label-sm text-text-muted">
            {f.name} · {formatFileSize(f.size)}
          </p>
          {f.kind === "video" ? (
            <video controls preload="metadata" src={f.url} className="w-full rounded-2xl bg-black" />
          ) : (
            <audio controls preload="metadata" src={f.url} className="w-full" />
          )}
        </div>
      ))}

      {docs.length > 0 && (
        <ul className="space-y-1.5">
          {docs.map((f) => (
            <li key={f.key}>
              <a
                href={f.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-2xl bg-canvas-cream px-3 py-2.5 text-on-surface transition-colors hover:bg-surface-container-low"
              >
                <Icon name="description" size={18} className="shrink-0 text-primary" />
                <span className="t-body-sm min-w-0 flex-1 truncate">{f.name}</span>
                <span className="t-label-sm shrink-0 text-text-muted">{formatFileSize(f.size)}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
