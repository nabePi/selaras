"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComingSoonButton } from "./coming-soon-button";
import { Icon } from "./icon";

const LABELS: Record<string, string> = {
  "/home": "Home",
  "/journal": "Journal",
  "/profil": "Profil",
};

export function AppHeader() {
  const pathname = usePathname();
  const label = LABELS[pathname] ?? "";

  return (
    <header className="pt-safe fixed top-0 left-1/2 z-50 w-full max-w-[480px] -translate-x-1/2 bg-surface/85 shadow-[0_1px_12px_rgba(92,75,62,0.04)] backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-margin">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-full bg-sage-tint text-primary">
            <Icon name="spa" size={20} />
          </span>
          <div className="flex flex-col">
            <span className="t-headline-sm tracking-tight text-on-surface">
              Selaras Life
            </span>
            <span className="t-label-sm text-text-muted">{label}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ComingSoonButton
            feature="Notifikasi"
            aria-label="Notifikasi"
            className="relative flex size-11 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-low"
          >
            <Icon name="notifications" size={22} />
            <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-accent-coral ring-2 ring-surface" />
          </ComingSoonButton>
          <Link href="/profil" aria-label="Profil saya">
            <Image
              src="/images/logo-avatar.png"
              alt=""
              width={32}
              height={32}
              className="size-8 rounded-full object-cover ring-1 ring-border-subtle"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
