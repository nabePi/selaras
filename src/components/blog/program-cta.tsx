import Link from "next/link";
import { Icon } from "../icon";

/** Ajakan di akhir artikel untuk melihat program Selaras. */
export function ProgramCta() {
  return (
    <section aria-label="Ajakan melihat program" className="flex flex-col items-center gap-3 rounded-3xl bg-sage-tint p-6 text-center shadow-sm">
      <span className="flex size-12 items-center justify-center rounded-full bg-primary text-on-primary">
        <Icon name="auto_stories" size={24} />
      </span>
      <div className="flex max-w-[340px] flex-col gap-1">
        <h2 className="t-headline-sm font-semibold text-on-surface">Ingin Hidup Lebih Selaras Bersama Keluarga?</h2>
        <p className="t-body-md leading-relaxed text-text-muted">
          Jelajahi program Selaras: kelas dan pendampingan bersama konselor keluarga untuk pernikahan, kehamilan, menyusui, dan parenting.
        </p>
      </div>
      <Link
        href="/program"
        className="t-title-sm mt-1 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-on-primary shadow-md transition-colors hover:bg-primary-container active:scale-[0.98]"
      >
        Lihat Program Selaras
        <Icon name="arrow_forward" size={18} />
      </Link>
    </section>
  );
}
