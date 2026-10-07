import { parseRich, type RichNode } from "@/lib/rich-text";

function render(nodes: RichNode[]): React.ReactNode {
  return nodes.map((n, i) => {
    switch (n.t) {
      case "text":
        return n.v;
      case "br":
        return <br key={i} />;
      case "b":
        return <strong key={i}>{render(n.c)}</strong>;
      case "i":
        return <em key={i}>{render(n.c)}</em>;
      case "u":
        return <u key={i}>{render(n.c)}</u>;
      case "sm":
        return <span key={i} className="text-[0.85em]">{render(n.c)}</span>;
      case "lg":
        return <span key={i} className="text-[1.25em] leading-snug">{render(n.c)}</span>;
      case "xl":
        return <span key={i} className="text-[1.5em] leading-snug">{render(n.c)}</span>;
      case "q":
        return (
          <blockquote key={i} className="my-1.5 border-l-4 border-primary/40 pl-3 font-normal text-on-surface-variant italic">
            {render(n.c)}
          </blockquote>
        );
    }
  });
}

/** Menampilkan teks pertanyaan berformat (lihat lib/rich-text) sebagai elemen React, bukan HTML mentah. */
export function RichText({ value, className }: { value: string; className?: string }) {
  return <div className={className}>{render(parseRich(value))}</div>;
}
