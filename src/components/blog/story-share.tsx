"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Dialog } from "../dialog";
import { Icon } from "../icon";

const phoneQuery = "(max-width: 767px) and (pointer: coarse)";
function subscribePhone(change: () => void) {
  const query = window.matchMedia(phoneQuery);
  query.addEventListener("change", change);
  return () => query.removeEventListener("change", change);
}
function isPhone() {
  return /iPhone|iPod|Android.*Mobile/i.test(navigator.userAgent) || window.matchMedia(phoneQuery).matches;
}

export function StoryShare({ path }: { path: string }) {
  const mobile = useSyncExternalStore(subscribePhone, isPhone, () => false);
  const [open, setOpen] = useState(false);
  if (!mobile) return null;

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="t-title-sm inline-flex items-center gap-1.5 rounded-full bg-sage-tint px-4 py-2 text-primary shadow-sm transition-all hover:bg-primary-fixed active:scale-95">
        <Icon name="photo_camera" size={18} />
        Story Instagram
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Bagikan ke Story Instagram" size="sm">
        <StoryComposer path={path} />
      </Dialog>
    </>
  );
}

function StoryComposer({ path }: { path: string }) {
  const [asset, setAsset] = useState<{ file: File; url: string; canShare: boolean } | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [sharing, setSharing] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let preview: string | undefined;
    async function prepare() {
      try {
        const response = await fetch(`/api${path}/story`, { signal: controller.signal });
        if (!response.ok || !response.headers.get("content-type")?.startsWith("image/png")) throw new Error("Gambar Story belum bisa disiapkan. Coba lagi.");
        const blob = await response.blob();
        if (controller.signal.aborted) return;
        const file = new File([blob], "selaras-story.png", { type: "image/png" });
        preview = URL.createObjectURL(blob);
        setAsset({ file, url: preview, canShare: typeof navigator.share === "function" && Boolean(navigator.canShare?.({ files: [file] })) });
      } catch {
        if (!controller.signal.aborted) setError("Gambar Story belum bisa disiapkan. Periksa koneksi, lalu coba lagi.");
      }
    }
    void prepare();
    return () => { controller.abort(); if (preview) URL.revokeObjectURL(preview); };
  }, [path, attempt]);

  async function share() {
    if (!asset || sharing) return;
    setSharing(true);
    setMessage("");
    try {
      // The file is prepared beforehand so this call retains the user's tap activation.
      await navigator.share({ files: [asset.file] });
    } catch (e) {
      if (!(e instanceof Error && e.name === "AbortError")) setMessage("Belum bisa membagikan gambar. Unduh gambar, lalu pilih dari galeri Instagram.");
    } finally {
      setSharing(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(new URL(path, window.location.origin).href);
      setMessage("Tautan tersalin. Tempel melalui stiker Link di Story Instagram.");
    } catch {
      setMessage("Tautan belum bisa disalin. Salin alamat artikel dari browser untuk stiker Link.");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="t-body-md text-on-surface-variant">Pilih Instagram lalu Story di menu berbagi jika tersedia. Kamu bisa meninjau gambar sebelum mengunggahnya.</p>
      {!asset && !error && <p role="status" className="t-body-sm text-text-muted">Menyiapkan gambar Story…</p>}
      {error && <div role="alert" className="t-body-sm text-error"><p>{error}</p><button type="button" className="mt-2 underline" onClick={() => { setError(""); setAttempt((n) => n + 1); }}>Coba lagi</button></div>}
      {asset && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset.url} alt="Pratinjau gambar artikel untuk Story Instagram" className="mx-auto aspect-[9/16] w-40 rounded-xl" />
          {asset.canShare ? (
            <button type="button" disabled={sharing} onClick={() => void share()} className="t-title-sm rounded-full bg-primary px-5 py-3 text-on-primary disabled:opacity-60">{sharing ? "Membuka menu berbagi…" : "Bagikan gambar Story"}</button>
          ) : <p className="t-body-sm text-text-muted">Unduh gambar ini, lalu unggah dari galeri ke Story Instagram.</p>}
          <a href={asset.url} download="selaras-story.png" className="t-title-sm rounded-full bg-sage-tint px-5 py-3 text-center text-primary">Unduh gambar Story</a>
        </>
      )}
      <button type="button" onClick={() => void copyLink()} className="t-title-sm self-center px-4 py-2 text-primary underline">Salin tautan artikel</button>
      <p className="t-body-sm text-text-muted">Tambahkan stiker Link di Instagram agar temanmu bisa membuka artikel.</p>
      {message && <p role="status" className="t-body-sm text-on-surface-variant">{message}</p>}
    </div>
  );
}
