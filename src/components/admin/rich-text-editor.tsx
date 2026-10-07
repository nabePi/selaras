"use client";

import { useEffect, useRef, useState } from "react";
import { normalizeRich, serializeRich, type FontSize, type RichNode } from "@/lib/rich-text";
import { Icon } from "../icon";

type Command = "bold" | "italic" | "underline" | "quote";

const TOOLS: { cmd: Command; label: string; icon: string; hint: string }[] = [
  { cmd: "bold", label: "Tebal", icon: "format_bold", hint: "Ctrl+B" },
  { cmd: "italic", label: "Miring", icon: "format_italic", hint: "Ctrl+I" },
  { cmd: "underline", label: "Garis bawah", icon: "format_underlined", hint: "Ctrl+U" },
  { cmd: "quote", label: "Kutipan", icon: "format_quote", hint: "" },
];

type Size = "sm" | "normal" | "lg" | "xl";

/** Nilai `fontSize` execCommand (1-7) untuk tiap tingkat; dipetakan balik di `sizeOfFont`. */
const SIZE_VALUE: Record<Size, string> = { sm: "2", normal: "3", lg: "5", xl: "6" };
const SIZES: { size: Size; label: string; px: number }[] = [
  { size: "sm", label: "Kecil", px: 12 },
  { size: "normal", label: "Normal", px: 15 },
  { size: "lg", label: "Besar", px: 18 },
  { size: "xl", label: "Sangat besar", px: 22 },
];

function sizeOfFont(value: string | null): Size {
  const n = Number(value);
  return n >= 6 ? "xl" : n >= 4 ? "lg" : n && n <= 2 ? "sm" : "normal";
}

/** DOM contenteditable -> pohon RichNode (hanya tag yang dikenal; sisanya hanya diambil isinya). */
function toNodes(parent: Node): RichNode[] {
  const out: RichNode[] = [];
  const push = (n: RichNode) => {
    const last = out[out.length - 1];
    if (n.t === "text" && last?.t === "text") last.v += n.v;
    else out.push(n);
  };
  parent.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      const v = (child.textContent ?? "").replace(/ /g, " ");
      if (v) push({ t: "text", v });
      return;
    }
    if (!(child instanceof HTMLElement)) return;
    switch (child.tagName) {
      case "BR":
        return push({ t: "br" });
      case "B":
      case "STRONG":
        return void out.push({ t: "b", c: toNodes(child) });
      case "I":
      case "EM":
        return void out.push({ t: "i", c: toNodes(child) });
      case "U":
        return void out.push({ t: "u", c: toNodes(child) });
      case "FONT": {
        const size = sizeOfFont(child.getAttribute("size"));
        if (size === "normal") return void toNodes(child).forEach(push);
        return void out.push({ t: size as FontSize, c: toNodes(child) });
      }
      case "BLOCKQUOTE":
        return void out.push({ t: "q", c: toNodes(child) });
      case "DIV":
      case "P": {
        // Enter di contenteditable membuat <div> per baris: pisahkan dari konten sebelumnya.
        if (out.length && out[out.length - 1].t !== "br") push({ t: "br" });
        toNodes(child).forEach(push);
        return;
      }
      default:
        toNodes(child).forEach(push);
    }
  });
  return out;
}

const readValue = (el: HTMLElement) => normalizeRich(serializeRich(toNodes(el)));

/**
 * Editor WYSIWYG mini untuk teks pertanyaan: tebal, miring, garis bawah, kutipan, dan baris baru.
 * Tak terkendali (uncontrolled) agar kursor tidak lompat; `value` hanya dipakai sebagai isi awal,
 * jadi beri `key` baru bila ingin memuat ulang isinya.
 */
export function RichTextEditor({
  id,
  value,
  onChange,
  placeholder,
  invalid,
  label,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  invalid?: boolean;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Record<Command, boolean>>({ bold: false, italic: false, underline: false, quote: false });
  const [empty, setEmpty] = useState(!value);
  const [size, setSize] = useState<Size>("normal");

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = normalizeRich(value);
    // Hanya isi awal: lihat catatan komponen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function sync() {
      const el = ref.current;
      const sel = document.getSelection();
      if (!el || !sel?.anchorNode || !el.contains(sel.anchorNode)) return;
      const node = sel.anchorNode instanceof Element ? sel.anchorNode : sel.anchorNode.parentElement;
      setActive({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        quote: !!node?.closest("blockquote"),
      });
      setSize(sizeOfFont(document.queryCommandValue("fontSize")));
    }
    document.addEventListener("selectionchange", sync);
    return () => document.removeEventListener("selectionchange", sync);
  }, []);

  function emit() {
    const el = ref.current;
    if (!el) return;
    const next = readValue(el);
    setEmpty(next === "");
    onChange(next);
  }

  function run(cmd: Command) {
    const el = ref.current;
    if (!el) return;
    el.focus();
    if (cmd === "quote") {
      const sel = document.getSelection();
      const node = sel?.anchorNode instanceof Element ? sel.anchorNode : sel?.anchorNode?.parentElement;
      document.execCommand("formatBlock", false, node?.closest("blockquote") ? "div" : "blockquote");
    } else document.execCommand(cmd);
    emit();
  }

  function applySize(next: Size) {
    const el = ref.current;
    if (!el) return;
    el.focus();
    document.execCommand("fontSize", false, SIZE_VALUE[next]);
    setSize(next);
    emit();
  }

  return (
    <div className={`overflow-hidden rounded-2xl border bg-surface-container-lowest ${invalid ? "border-error ring-2 ring-error" : "border-outline-variant focus-within:border-sage-medium focus-within:ring-2 focus-within:ring-sage-medium"}`}>
      <div role="toolbar" aria-label="Format teks" aria-controls={id} className="flex items-center gap-1 border-b border-outline-variant/60 bg-canvas-ivory px-2 py-1.5">
        {TOOLS.map((t) => (
          <button
            key={t.cmd}
            type="button"
            title={t.hint ? `${t.label} (${t.hint})` : t.label}
            aria-label={t.label}
            aria-pressed={active[t.cmd]}
            // mousedown dicegah agar seleksi teks di editor tidak hilang saat tombol ditekan.
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => run(t.cmd)}
            className={`flex size-8 items-center justify-center rounded-lg transition-colors ${active[t.cmd] ? "bg-sage-tint text-primary" : "text-text-muted hover:bg-surface-container-low hover:text-on-surface"}`}
          >
            <Icon name={t.icon} size={19} />
          </button>
        ))}
        <span aria-hidden="true" className="mx-1 h-5 w-px bg-outline-variant/60" />
        <div role="group" aria-label="Ukuran font" className="flex items-center gap-0.5">
          {SIZES.map((s) => (
            <button
              key={s.size}
              type="button"
              title={`Ukuran ${s.label.toLowerCase()}`}
              aria-label={`Ukuran ${s.label.toLowerCase()}`}
              aria-pressed={size === s.size}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applySize(s.size)}
              className={`flex size-8 items-center justify-center rounded-lg font-semibold transition-colors ${size === s.size ? "bg-sage-tint text-primary" : "text-text-muted hover:bg-surface-container-low hover:text-on-surface"}`}
              style={{ fontSize: s.px }}
            >
              A
            </button>
          ))}
        </div>
        <span className="t-label-sm ml-auto hidden pr-1 text-text-muted sm:inline">Enter = baris baru</span>
      </div>
      <div className="relative">
        {empty && placeholder && (
          <span aria-hidden="true" className="t-body-md pointer-events-none absolute top-2.5 left-3.5 text-text-muted/60">
            {placeholder}
          </span>
        )}
        <div
          ref={ref}
          id={id}
          role="textbox"
          aria-multiline="true"
          aria-label={label}
          aria-invalid={invalid || undefined}
          contentEditable
          suppressContentEditableWarning
          spellCheck
          onInput={emit}
          onBlur={emit}
          onPaste={(e) => {
            // Tempel sebagai teks polos agar format dari situs/dokumen lain tidak ikut masuk.
            e.preventDefault();
            document.execCommand("insertText", false, e.clipboardData.getData("text/plain"));
          }}
          className="t-body-md min-h-24 w-full px-3.5 py-2.5 text-on-surface outline-none [&_blockquote]:my-1 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:pl-3 [&_blockquote]:italic [&_font[size='2']]:text-[0.85em] [&_font[size='5']]:text-[1.25em] [&_font[size='6']]:text-[1.5em]"
        />
      </div>
    </div>
  );
}
