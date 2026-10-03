import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="pt-safe fixed top-0 left-1/2 z-50 w-full max-w-[480px] -translate-x-1/2 bg-surface/85 shadow-[0_1px_8px_rgba(92,75,62,0.04)] backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-margin">
        <Link href="/" aria-label="Selaras Life" className="flex items-center">
          <Image
            src="/images/logo-header.png"
            alt="Selaras Life"
            width={720}
            height={323}
            sizes="100px"
            className="h-11 w-auto"
            priority
          />
        </Link>

        <Link
          href="/masuk"
          className="t-title-sm flex min-h-10 items-center justify-center rounded-full bg-sage-tint px-5 text-primary transition-colors hover:bg-primary-fixed active:scale-[0.98]"
        >
          Masuk
        </Link>
      </div>
    </header>
  );
}
