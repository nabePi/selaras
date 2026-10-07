/**
 * Teks pertanyaan prompt boleh berformat: tebal, miring, garis bawah, kutipan, ukuran font, dan baris baru.
 * Disimpan sebagai subset HTML sempit (`<b> <i> <u> <blockquote> <sm> <lg> <xl> <br>`, teks di-escape) dan
 * SELALU diparse ulang lewat parser di sini (tidak pernah dirender sebagai HTML mentah), jadi
 * markup lain apa pun hanya menjadi teks biasa.
 */
export type RichNode =
  | { t: "text"; v: string }
  | { t: "br" }
  | { t: ContainerKind; c: RichNode[] };

type ContainerKind = "b" | "i" | "u" | "q" | FontSize;

/**
 * Ukuran font hanya tiga tingkat relatif (em) terhadap ukuran teks pertanyaan, jadi tidak ada
 * ukuran yang bisa merusak tampilan: kecil 0.85em, normal (tanpa tag), besar 1.25em, sangat besar 1.5em.
 */
export type FontSize = "sm" | "lg" | "xl";
export const FONT_SIZE_EM: Record<FontSize, number> = { sm: 0.85, lg: 1.25, xl: 1.5 };

const TAG_KIND = { b: "b", i: "i", u: "u", blockquote: "q", sm: "sm", lg: "lg", xl: "xl" } as const;
const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" };
const TOKEN = /<(\/?)(b|i|u|blockquote|sm|lg|xl)>|<br\s*\/?>|&(amp|lt|gt|quot|#39);|[^<&]+|[<&]/gi;

export function parseRich(src: string): RichNode[] {
  const root: RichNode[] = [];
  const stack: { kind: ContainerKind; c: RichNode[] }[] = [];
  const cur = () => (stack.length ? stack[stack.length - 1].c : root);
  const text = (v: string) => {
    const list = cur();
    const last = list[list.length - 1];
    if (last?.t === "text") last.v += v;
    else list.push({ t: "text", v });
  };

  for (const m of src.matchAll(TOKEN)) {
    const [tok, closing, tag, entity] = m;
    if (tag) {
      const kind = TAG_KIND[tag.toLowerCase() as keyof typeof TAG_KIND];
      if (!closing) stack.push({ kind, c: [] });
      else {
        const at = stack.map((s) => s.kind).lastIndexOf(kind);
        if (at < 0) continue; // penutup tanpa pembuka: abaikan
        while (stack.length > at) {
          const done = stack.pop()!;
          if (done.c.length) cur().push({ t: done.kind, c: done.c });
        }
      }
    } else if (/^<br/i.test(tok)) cur().push({ t: "br" });
    else if (entity) text(ENTITIES[entity.toLowerCase()]);
    else text(tok);
  }
  while (stack.length) {
    const done = stack.pop()!;
    if (done.c.length) cur().push({ t: done.kind, c: done.c });
  }
  return trimBreaks(root);
}

function trimBreaks(nodes: RichNode[]): RichNode[] {
  let a = 0;
  let b = nodes.length;
  while (a < b && nodes[a].t === "br") a++;
  while (b > a && nodes[b - 1].t === "br") b--;
  return nodes.slice(a, b);
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function serializeRich(nodes: RichNode[]): string {
  return nodes
    .map((n) => {
      if (n.t === "text") return esc(n.v);
      if (n.t === "br") return "<br>";
      const tag = n.t === "q" ? "blockquote" : n.t;
      return `<${tag}>${serializeRich(n.c)}</${tag}>`;
    })
    .join("");
}

/** Bentuk kanonis yang aman disimpan: markup tak dikenal dibuang, tag yang tak seimbang dirapikan. */
export const normalizeRich = (src: string) => serializeRich(parseRich(src));

function plainOf(nodes: RichNode[]): string {
  return nodes.map((n) => (n.t === "text" ? n.v : n.t === "br" ? "\n" : plainOf(n.c))).join("");
}

/** Teks polos (baris baru jadi "\n") untuk aria-label, ringkasan, dan validasi panjang. */
export const richToPlain = (src: string) => plainOf(parseRich(src)).trim();

/** Satu baris pertama sebagai teks polos (untuk ringkasan di kartu). */
export const richFirstLine = (src: string) => richToPlain(src).split("\n")[0] ?? "";
