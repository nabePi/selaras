import Image from "next/image";
import Link from "next/link";
import { Icon } from "./icon";

/** Header halaman fokus (tanpa tab bawah): tombol kembali + judul. */
type Props = {
  title: string;
  backHref: string;
  /** Judul di tengah (halaman masuk/daftar); default di kiri dekat tombol kembali. */
  centered?: boolean;
  /** Sembunyikan logo di kanan header. */
  hideLogo?: boolean;
};

export function FocusHeader({ title, backHref, centered = false, hideLogo = false }: Props) {
  return (
    <header className="pt-safe print:hidden fixed top-0 left-1/2 z-50 w-full max-w-[480px] -translate-x-1/2 bg-surface/85 shadow-[0_1px_12px_rgba(92,75,62,0.04)] backdrop-blur-xl">
      <div
        className={`h-16 items-center px-2 ${
          centered ? "grid grid-cols-[2.75rem_1fr_2.75rem] gap-1" : "flex justify-between"
        }`}
      >
        <div className="flex items-center gap-1">
          <Link
            href={backHref}
            aria-label="Kembali"
            className="flex size-11 items-center justify-center rounded-full text-on-surface transition-colors hover:bg-surface-container-low"
          >
            <Icon name="arrow_back" size={22} />
          </Link>
          {!centered && (
            <h1 className="t-headline-sm line-clamp-1 tracking-tight text-on-surface">{title}</h1>
          )}
        </div>
        {centered && (
          <p className="t-title-sm text-center font-semibold tracking-tight text-on-surface">
            {title}
          </p>
        )}
        <div className={`flex items-center justify-end ${centered ? "" : "pr-3"}`}>
          {!hideLogo && (
            <Image
              src="/images/logo-avatar.png"
              alt=""
              width={32}
              height={32}
              className="size-8 rounded-full object-cover ring-1 ring-border-subtle"
            />
          )}
        </div>
      </div>
    </header>
  );
}
