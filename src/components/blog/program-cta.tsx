import Link from "next/link";
import { Icon } from "../icon";

/** Ajakan singkat di akhir artikel untuk melihat program Selaras. */
export function ProgramCta() {
  return (
    <section aria-label="Ajakan melihat program">
      <Link
        href="/program"
        className="flex items-center gap-3 rounded-2xl bg-sage-tint px-4 py-3 transition-colors hover:bg-primary-fixed"
      >
        <Icon name="auto_stories" size={22} className="shrink-0 text-primary" />
        <p className="t-body-md min-w-0 flex-1 text-on-surface">
          Mau melangkah lebih jauh? <span className="font-semibold text-primary">Kenali program Selaras</span>
        </p>
        <Icon name="arrow_forward" size={18} className="shrink-0 text-primary" />
      </Link>
    </section>
  );
}
