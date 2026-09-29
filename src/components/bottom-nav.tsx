"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./icon";

const TABS = [
  { href: "/", label: "Beranda", icon: "spa" },
  { href: "/program", label: "Program", icon: "auto_stories" },
  { href: "/cerita", label: "Cerita", icon: "favorite" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi utama"
      className="pb-safe fixed bottom-0 left-1/2 z-50 w-full max-w-[480px] -translate-x-1/2 bg-surface/90 shadow-[0_-4px_20px_rgba(92,75,62,0.06)] backdrop-blur-xl"
    >
      <div className="p-3">
        <div className="flex flex-col gap-1.5">
          <Link
            href="/daftar"
            className="t-title-sm flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-center text-on-primary shadow-[0_4px_12px_rgba(78,97,72,0.2)] transition-all hover:bg-primary-container active:scale-[0.99]"
          >
            <span>Mulai Perjalanan</span>
            <Icon name="arrow_forward" size={18} />
          </Link>
          <div className="flex items-center justify-center gap-1 py-0.5">
            <span className="t-body-sm text-text-muted">Sudah punya akun?</span>
            <Link
              href="/masuk"
              className="t-title-sm px-1 py-1 text-primary hover:underline"
            >
              Masuk
            </Link>
          </div>
        </div>

        <ul className="mt-1 grid grid-cols-3 gap-1 border-t border-border-subtle/50 pt-2">
          {TABS.map((tab) => {
            const active =
              tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
            return (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-11 flex-col items-center justify-center rounded-xl py-1 transition-colors ${
                    active
                      ? "bg-sage-tint text-primary"
                      : "text-on-surface-variant hover:bg-surface-container-low"
                  }`}
                >
                  <Icon name={tab.icon} size={20} filled={active} />
                  <span className="t-label-sm">{tab.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
