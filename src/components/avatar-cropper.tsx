"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "./icon";

/** Sisi bingkai pemotong (px CSS) dan hasil akhir (px) yang diunggah. */
const FRAME = 256;
const OUTPUT = 512;
const MAX_ZOOM = 4;
const OUTPUT_TYPE = "image/webp";

type Point = { x: number; y: number };

/**
 * Pemotong foto profil: geser untuk memposisikan, zoom in/out (slider, tombol +/-, roll mouse, atau
 * cubit di layar sentuh) sampai foto pas di bingkai lingkaran. Zoom minimum membuat foto selalu
 * memenuhi bingkai, jadi hasilnya tidak pernah punya area kosong.
 */
export function AvatarCropper({
  file,
  onApply,
  onCancel,
}: {
  file: File;
  onApply: (result: { preview: string; blob: Blob }) => void;
  onCancel: () => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, Point>());
  const gesture = useRef<{ dist: number; zoom: number } | null>(null);

  // Dibaca sebagai data URL (bukan object URL) agar aman dari siklus mount/unmount dua kali di mode dev.
  useEffect(() => {
    const reader = new FileReader();
    reader.onload = () => setUrl(String(reader.result));
    reader.onerror = () => setError("Foto tidak dapat dibaca. Coba pilih foto lain.");
    reader.readAsDataURL(file);
    return () => reader.abort();
  }, [file]);

  // Skala dasar membuat sisi terpendek foto tepat memenuhi bingkai (zoom 1).
  const base = natural ? FRAME / Math.min(natural.w, natural.h) : 1;
  const scale = base * zoom;

  /** Menjaga foto tetap menutupi seluruh bingkai. */
  const clamp = useCallback(
    (p: Point, z: number): Point => {
      if (!natural) return p;
      const s = base * z;
      const maxX = Math.max(0, (natural.w * s - FRAME) / 2);
      const maxY = Math.max(0, (natural.h * s - FRAME) / 2);
      return { x: Math.min(maxX, Math.max(-maxX, p.x)), y: Math.min(maxY, Math.max(-maxY, p.y)) };
    },
    [natural, base],
  );

  const changeZoom = useCallback(
    (next: number) => {
      const z = Math.min(MAX_ZOOM, Math.max(1, next));
      setZoom(z);
      setOffset((o) => clamp(o, z));
    },
    [clamp],
  );

  // Roll mouse untuk zoom; listener non-pasif agar halaman tidak ikut tergulung.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      changeZoom(zoom - e.deltaY * 0.002);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoom, changeZoom]);

  function onPointerDown(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      gesture.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), zoom };
    }
  }

  function onPointerMove(e: React.PointerEvent) {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const cur = { x: e.clientX, y: e.clientY };
    pointers.current.set(e.pointerId, cur);

    if (pointers.current.size === 2 && gesture.current) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      changeZoom(gesture.current.zoom * (dist / gesture.current.dist));
    } else if (pointers.current.size === 1) {
      setOffset((o) => clamp({ x: o.x + cur.x - prev.x, y: o.y + cur.y - prev.y }, zoom));
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId);
    gesture.current = null;
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const step = 12;
    const move: Record<string, Point> = {
      ArrowLeft: { x: step, y: 0 },
      ArrowRight: { x: -step, y: 0 },
      ArrowUp: { x: 0, y: step },
      ArrowDown: { x: 0, y: -step },
    };
    if (move[e.key]) {
      e.preventDefault();
      setOffset((o) => clamp({ x: o.x + move[e.key].x, y: o.y + move[e.key].y }, zoom));
    } else if (e.key === "+" || e.key === "=") changeZoom(zoom + 0.2);
    else if (e.key === "-") changeZoom(zoom - 0.2);
  }

  function reset() {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }

  async function apply() {
    const img = imgRef.current;
    if (!img || !natural) return;
    setBusy(true);
    // Bagian foto yang tampak di bingkai (dalam piksel foto asli).
    const size = FRAME / scale;
    const sx = (natural.w * scale) / 2 - FRAME / 2 - offset.x;
    const sy = (natural.h * scale) / 2 - FRAME / 2 - offset.y;
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT;
    canvas.height = OUTPUT;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setBusy(false);
      return setError("Foto tidak dapat diproses.");
    }
    ctx.drawImage(img, sx / scale, sy / scale, size, size, 0, 0, OUTPUT, OUTPUT);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, OUTPUT_TYPE, 0.84));
    setBusy(false);
    if (!blob) return setError("Foto tidak dapat diproses.");
    onApply({ preview: URL.createObjectURL(blob), blob });
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        ref={frameRef}
        role="application"
        aria-label="Atur posisi foto. Geser untuk memindahkan, gunakan tombol plus dan minus untuk zoom."
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        className="relative cursor-grab touch-none overflow-hidden rounded-2xl bg-inverse-surface select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:cursor-grabbing"
        style={{ width: FRAME, height: FRAME }}
      >
        {url && (
          // eslint-disable-next-line @next/next/no-img-element -- pratinjau lokal, perlu ukuran & transform presisi
          <img
            ref={imgRef}
            src={url}
            alt=""
            draggable={false}
            onLoad={(e) => setNatural({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
            onError={() => setError("Foto tidak dapat dibaca. Coba pilih foto lain.")}
            className="pointer-events-none absolute top-1/2 left-1/2 max-w-none"
            style={{
              width: natural ? natural.w * scale : undefined,
              height: natural ? natural.h * scale : undefined,
              transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
            }}
          />
        )}
        {/* Bingkai lingkaran: bagian di luarnya diredupkan agar terlihat hasil akhir foto profil. */}
        <div className="pointer-events-none absolute inset-0 rounded-full shadow-[0_0_0_999px_rgba(0,0,0,0.55)] ring-2 ring-white/80" />
      </div>

      <div className="flex w-full max-w-[256px] items-center gap-2">
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => changeZoom(zoom - 0.2)}
          disabled={zoom <= 1}
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-canvas-ivory disabled:opacity-30"
        >
          <Icon name="remove" size={20} />
        </button>
        <input
          type="range"
          aria-label="Zoom"
          min={1}
          max={MAX_ZOOM}
          step={0.01}
          value={zoom}
          onChange={(e) => changeZoom(Number(e.target.value))}
          className="h-2 min-w-0 flex-1 cursor-pointer accent-primary"
        />
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => changeZoom(zoom + 0.2)}
          disabled={zoom >= MAX_ZOOM}
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-canvas-ivory disabled:opacity-30"
        >
          <Icon name="add" size={20} />
        </button>
      </div>
      <p className="t-body-sm text-center text-text-muted">Geser foto dan atur zoom sampai pas di lingkaran.</p>
      {error && (
        <p role="alert" className="t-body-sm text-center text-error">
          {error}
        </p>
      )}

      <div className="flex w-full items-center justify-between gap-2 pt-1">
        <button
          type="button"
          onClick={reset}
          className="t-label-md flex items-center gap-1 rounded-full px-3 py-2 text-text-muted transition-colors hover:bg-canvas-ivory"
        >
          <Icon name="restart_alt" size={16} />
          Atur ulang
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="t-title-sm rounded-full px-4 py-2 text-on-surface-variant transition-colors hover:bg-canvas-ivory"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => void apply()}
            disabled={!natural || busy}
            className="t-title-sm rounded-full bg-primary px-5 py-2 text-on-primary shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {busy ? "Memproses..." : "Pakai Foto"}
          </button>
        </div>
      </div>
    </div>
  );
}
