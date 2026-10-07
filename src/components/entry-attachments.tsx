"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import type { ResponseAttachment } from "@/data/prompt-responses";
import { EntryAudio } from "./entry-audio";
import { EntryVideo } from "./entry-video";
import { Icon } from "./icon";

type ImageAttachment = Extract<ResponseAttachment, { kind: "image" }>;

/**
 * Bagian "Lampiran Rasa" di detail jurnal: foto bisa diklik untuk dilihat besar, audio dan video
 * bisa diputar langsung.
 */
export function EntryAttachments({ attachments }: { attachments: ResponseAttachment[] }) {
  const [viewing, setViewing] = useState<ImageAttachment | null>(null);
  if (attachments.length === 0) return null;

  const images = attachments.filter((a): a is ImageAttachment => a.kind === "image");
  const others = attachments.filter((a) => a.kind !== "image");

  return (
    <section aria-label="Lampiran Rasa" className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="t-title-sm flex items-center gap-1.5 text-on-surface">
          <Icon name="attach_file" size={18} className="text-primary" />
          Lampiran Rasa
        </h2>
        <span className="t-label-sm font-normal text-text-muted">{attachments.length} lampiran</span>
      </div>

      {images.length > 0 && (
        <ul className={`grid gap-2 ${images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
          {images.map((img, i) => (
            <li key={img.id ?? `${i}-${img.title}`}>
              <button
                type="button"
                onClick={() => setViewing(img)}
                aria-label={`Lihat foto ${img.title}`}
                className={`group relative block w-full overflow-hidden rounded-2xl bg-surface-container shadow-inner focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${images.length === 1 ? "h-56" : "h-36"}`}
              >
                <Image
                  unoptimized={!img.src.startsWith("/")}
                  src={img.src}
                  alt={img.title}
                  fill
                  sizes="(max-width: 480px) 50vw, 220px"
                  className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                />
                <span className="absolute right-2 bottom-2 flex size-7 items-center justify-center rounded-full bg-inverse-surface/70 text-inverse-on-surface backdrop-blur-sm">
                  <Icon name="zoom_in" size={16} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {others.map((a, i) =>
        a.kind === "video" ? (
          <EntryVideo key={a.id ?? `${i}-${a.title}`} src={a.src} poster={a.poster} title={a.title} />
        ) : a.kind === "audio" ? (
          <EntryAudio key={a.id ?? `${i}-${a.title}`} title={a.title} meta={a.meta} src={a.src} />
        ) : null,
      )}

      <ImageViewer image={viewing} onClose={() => setViewing(null)} />
    </section>
  );
}

/** Tampilan foto penuh dalam <dialog>: Esc, klik latar, atau tombol tutup menutupnya. */
function ImageViewer({ image, onClose }: { image: ImageAttachment | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (image && !dialog.open) dialog.showModal();
    if (!image && dialog.open) dialog.close();
  }, [image]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="m-0 size-full max-h-none max-w-none items-center justify-center bg-transparent p-4 backdrop:bg-inverse-surface/85 backdrop:backdrop-blur-sm open:flex"
    >
      {image && (
        <figure className="flex max-h-full w-full max-w-lg flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <figcaption id={titleId} className="t-label-md min-w-0 truncate text-inverse-on-surface">
              {image.title}
            </figcaption>
            <button
              type="button"
              aria-label="Tutup foto"
              onClick={onClose}
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-inverse-on-surface/15 text-inverse-on-surface transition-colors hover:bg-inverse-on-surface/25"
            >
              <Icon name="close" size={20} />
            </button>
          </div>
          <div className="relative h-[78dvh] w-full overflow-hidden rounded-2xl">
            <Image unoptimized={!image.src.startsWith("/")} src={image.src} alt={image.title} fill sizes="(max-width: 512px) 100vw, 512px" className="object-contain" />
          </div>
        </figure>
      )}
    </dialog>
  );
}
