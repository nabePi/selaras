import Image from "next/image";
import Link from "next/link";
import { Icon } from "./icon";

export function SiteHeader() {
  return (
    <header className="pt-safe fixed top-0 left-1/2 z-50 w-full max-w-[480px] -translate-x-1/2 bg-surface/85 shadow-[0_1px_8px_rgba(92,75,62,0.04)] backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-margin">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-sage-tint">
            <Image
              src="/images/logo-avatar.png"
              alt=""
              width={32}
              height={32}
              className="size-8 rounded-full object-cover"
              priority
            />
          </span>
          <span className="flex items-center gap-1.5">
            <span className="t-title-md font-semibold tracking-tight text-on-surface">
              Selaras Life
            </span>
            <span className="t-label-sm rounded-full bg-sage-tint px-2 py-0.5 font-medium text-primary">
              Tumbuh Selaras
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/masuk"
            className="t-title-sm flex min-h-11 items-center justify-center rounded-full px-3.5 text-primary transition-colors hover:text-primary-container"
          >
            Masuk
          </Link>
          <Link
            href="/program"
            aria-label="Jelajahi program"
            className="flex size-11 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-low"
          >
            <Icon name="explore" size={22} />
          </Link>
        </div>
      </div>
    </header>
  );
}
