"use client";

import { useEffect, useState } from "react";
import { Icon } from "./icon";

/** Halaman harus sudah cukup jauh digulir sebelum tombol boleh muncul. */
const MIN_SCROLL = 600;
/** Jarak gulir ke atas (px) dari titik terbawah sebelum tombol muncul. */
const UP_DISTANCE = 160;

/**
 * Tombol kembali ke atas. Muncul hanya saat pembaca sudah jauh ke bawah lalu mulai menggulir ke atas,
 * dan langsung hilang saat menggulir ke bawah lagi, supaya tidak menutupi bacaan.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    // Posisi terbawah sejak terakhir kali pembaca menggulir ke bawah.
    let lowest = lastY;
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      if (y < MIN_SCROLL) {
        lowest = y;
        setVisible(false);
      } else if (y > lastY) {
        lowest = y;
        setVisible(false);
      } else if (y < lastY && lowest - y > UP_DISTANCE) {
        setVisible(true);
      }
      lastY = y;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  function toTop() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <div className="pointer-events-none fixed bottom-0 left-1/2 z-40 h-0 w-full max-w-[480px] -translate-x-1/2">
      <button
        type="button"
        onClick={toTop}
        aria-label="Kembali ke atas"
        tabIndex={visible ? 0 : -1}
        aria-hidden={!visible}
        className={`absolute right-4 bottom-[calc(5.75rem+env(safe-area-inset-bottom,0px))] flex size-11 items-center justify-center rounded-full border border-outline-variant bg-surface/90 text-primary shadow-md backdrop-blur transition-all duration-200 motion-reduce:transition-none ${
          visible ? "pointer-events-auto translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        <Icon name="keyboard_arrow_up" size={24} />
      </button>
    </div>
  );
}
