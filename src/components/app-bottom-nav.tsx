"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./icon";

const TABS = [
  { href: "/home", label: "Home", icon: "home" },
  { href: "/journal", label: "Journal", icon: "menu_book" },
  { href: "/profil", label: "Profil", icon: "person" },
] as const;

export function AppBottomNav({ pendingCount = 0 }: { pendingCount?: number }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi member"
      className="pb-safe pointer-events-none fixed bottom-0 left-1/2 z-50 w-full max-w-[480px] -translate-x-1/2 px-margin"
    >
      <ul className="pointer-events-auto mb-3 flex items-center justify-between gap-1 rounded-full bg-surface-bright/95 px-4 py-1 shadow-[0_8px_30px_rgba(92,75,62,0.08)] ring-1 ring-border-subtle/70 backdrop-blur-xl">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-full py-2 transition-all ${
                  active
                    ? "bg-sage-tint font-semibold text-primary"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="relative flex items-center justify-center">
                  <Icon name={tab.icon} size={22} filled={active} />
                  {tab.href === "/journal" && pendingCount > 0 && (
                    <span
                      aria-label={`${pendingCount} refleksi tertunda`}
                      className="absolute -top-1 -right-2 rounded-full bg-secondary px-1.5 text-[10px] leading-tight font-medium text-on-secondary"
                    >
                      {pendingCount}
                    </span>
                  )}
                </span>
                <span className="t-label-sm">{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
