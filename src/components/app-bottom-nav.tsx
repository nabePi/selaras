"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./icon";

const TABS = [
  { href: "/home", label: "Home", icon: "home" },
  { href: "/journal", label: "Journal", icon: "menu_book" },
  // Halaman katalog yang sama dengan Program untuk pengunjung (di luar grup tab member).
  { href: "/program", label: "Program", icon: "auto_stories" },
  { href: "/profil", label: "Profil", icon: "person" },
] as const;

export function AppBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi member"
      className="pb-safe fixed bottom-0 left-1/2 z-50 w-full max-w-[480px] -translate-x-1/2 bg-surface/90 shadow-[0_-4px_20px_rgba(92,75,62,0.06)] backdrop-blur-xl"
    >
      <ul className="grid grid-cols-4 gap-1 p-3">
        {TABS.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
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
    </nav>
  );
}
