"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Icon } from "../icon";
import { ADMIN_NAV } from "./nav";
import { NudgeDialog, type NudgeAudience } from "./nudge-dialog";

type AdminUi = { openNudge: (audience?: NudgeAudience) => void };
const AdminUiContext = createContext<AdminUi | null>(null);

export function useAdminUi() {
  const ctx = useContext(AdminUiContext);
  if (!ctx) throw new Error("useAdminUi harus dipakai di dalam <AdminShell>");
  return ctx;
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [nudge, setNudge] = useState<{ open: boolean; audience: NudgeAudience }>({
    open: false,
    audience: "backlog",
  });

  const openNudge = useCallback(
    (audience: NudgeAudience = "backlog") => setNudge({ open: true, audience }),
    [],
  );

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  /** Layar lebar: ciutkan/lebarkan sidebar. Layar kecil: buka laci menu. */
  function toggleMenu() {
    if (window.matchMedia("(min-width: 1024px)").matches) setCollapsed((c) => !c);
    else setMenuOpen(true);
  }

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <AdminUiContext.Provider value={{ openNudge }}>
      <a
        href="#konten-admin"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[70] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary"
      >
        Lewati ke konten
      </a>

      {menuOpen && (
        <div
          aria-hidden="true"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-40 bg-on-surface/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 flex h-full w-72 flex-col justify-between overflow-hidden bg-canvas-cream shadow-[0_1px_8px_rgba(92,75,62,0.04)] transition-[transform,width] duration-200 lg:translate-x-0 ${
          collapsed ? "lg:w-20" : "lg:w-72"
        } ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col">
          <div className={`pt-7 pb-6 ${collapsed ? "px-6 lg:flex lg:justify-center lg:px-0" : "px-6"}`}>
            <Link href="/admin" aria-label="Selaras Life" className="inline-flex">
              <Image
                src="/images/logo-header.png"
                alt="Selaras Life"
                width={720}
                height={323}
                sizes="160px"
                className={`h-14 w-auto ${collapsed ? "lg:hidden" : ""}`}
                priority
              />
              {collapsed && (
                <Image
                  src="/images/logo-mark.png"
                  alt=""
                  width={44}
                  height={44}
                  className="hidden size-11 object-contain lg:block"
                />
              )}
            </Link>
          </div>
          <nav aria-label="Navigasi admin" className="px-4 py-2">
            <ul className="flex flex-col gap-1.5">
              {ADMIN_NAV.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setMenuOpen(false)}
                      title={collapsed ? item.label : undefined}
                      className={`flex items-center gap-3.5 rounded-2xl px-4 py-3 transition-all duration-200 ${
                        collapsed ? "lg:justify-center lg:px-0" : ""
                      } ${
                        active
                          ? "bg-primary-container font-semibold text-on-primary-container shadow-sm"
                          : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                      }`}
                    >
                      <Icon name={item.icon} size={20} filled={active} />
                      <span className={`t-title-sm ${collapsed ? "lg:sr-only" : ""}`}>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Header */}
      <header
        className={`fixed top-0 right-0 left-0 z-30 h-20 bg-surface/85 shadow-[0_1px_8px_rgba(92,75,62,0.03)] backdrop-blur-xl transition-[left] duration-200 ${
          collapsed ? "lg:left-20" : "lg:left-72"
        }`}
      >
        <div className="flex h-20 w-full items-center justify-between gap-3 px-4 sm:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <button
              type="button"
              aria-label="Menu navigasi"
              onClick={toggleMenu}
              className="flex size-11 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-low"
            >
              <Icon name="menu" size={24} />
            </button>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-3 sm:pl-3">
              <p className="t-title-sm hidden leading-tight font-semibold text-on-surface md:block">
                Anggit Octaviani
              </p>
              {/* Sementara mengarah ke halaman masuk; ganti dengan aksi logout saat auth tersedia. */}
              <Link
                href="/masuk"
                aria-label="Keluar"
                title="Keluar"
                className="rounded-full bg-canvas-cream p-2.5 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-error"
              >
                <Icon name="logout" size={20} />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main
        id="konten-admin"
        className={`min-h-dvh bg-surface pt-20 transition-[padding] duration-200 ${collapsed ? "lg:pl-20" : "lg:pl-72"}`}
      >
        {children}
      </main>

      <NudgeDialog
        key={nudge.audience}
        open={nudge.open}
        onClose={() => setNudge((n) => ({ ...n, open: false }))}
        initialAudience={nudge.audience}
      />
    </AdminUiContext.Provider>
  );
}
