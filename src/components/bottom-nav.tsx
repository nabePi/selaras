"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./icon";

const TABS = [
  { href: "/", label: "Beranda", icon: "spa" },
  { href: "/program", label: "Program", icon: "auto_stories" },
  { href: "/blog", label: "Blog", icon: "edit_note" },
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
        <ul className="grid grid-cols-4 gap-1">
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
