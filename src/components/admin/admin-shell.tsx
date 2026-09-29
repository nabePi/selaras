"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Icon } from "../icon";
import { useToast } from "../toast-provider";
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
  const { showToast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
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
        className={`fixed top-0 left-0 z-50 flex h-full w-72 flex-col justify-between bg-canvas-cream shadow-[0_1px_8px_rgba(92,75,62,0.04)] transition-transform duration-200 lg:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col">
          <div className="flex items-center gap-3 px-6 pt-7 pb-6">
            <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-sage-tint">
              <Image src="/images/logo-avatar.png" alt="Logo Selaras Life" width={40} height={40} className="size-full object-cover" />
            </span>
            <div className="flex flex-col">
              <span className="t-headline-sm leading-tight text-on-surface">Selaras Life</span>
              <span className="t-label-sm tracking-wider text-text-muted uppercase">Admin &amp; Coach Console</span>
            </div>
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
                      className={`flex items-center gap-3.5 rounded-2xl px-4 py-3 transition-all duration-200 ${
                        active
                          ? "bg-primary-container font-semibold text-on-primary-container shadow-sm"
                          : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                      }`}
                    >
                      <Icon name={item.icon} size={20} filled={active} />
                      <span className="t-title-sm">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between rounded-2xl bg-surface-container-low p-3.5">
            <div className="flex items-center gap-2.5">
              <span className="size-2.5 animate-pulse rounded-full bg-primary-container" />
              <span className="t-label-sm text-on-surface">Mode Pendampingan Aktif</span>
            </div>
            <Icon name="verified" size={18} className="text-primary" />
          </div>
          <div className="flex items-center justify-between px-2 text-on-surface-variant">
            <Link
              href="/admin/panduan"
              onClick={() => setMenuOpen(false)}
              aria-current={pathname === "/admin/panduan" ? "page" : undefined}
              className={`t-label-md flex items-center gap-2 transition-colors hover:text-on-surface ${
                pathname === "/admin/panduan" ? "font-semibold text-primary" : ""
              }`}
            >
              <Icon name="help_outline" size={18} />
              <span>Panduan &amp; SOP</span>
            </Link>
            <span className="t-label-sm font-normal text-text-muted">v2.4 Coach</span>
          </div>
        </div>
      </aside>

      {/* Header */}
      <header className="fixed top-0 right-0 left-0 z-30 h-20 bg-surface/85 shadow-[0_1px_8px_rgba(92,75,62,0.03)] backdrop-blur-xl lg:left-72">
        <div className="flex h-20 w-full items-center justify-between gap-3 px-4 sm:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <button
              type="button"
              aria-label="Buka menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
              className="flex size-11 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-low lg:hidden"
            >
              <Icon name="menu" size={24} />
            </button>
            <form
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                showToast("Pencarian global akan hadir pada fase berikutnya ✨");
              }}
              className="relative hidden w-full max-w-lg md:block"
            >
              <Icon name="search" size={20} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-text-muted" />
              <label htmlFor="admin-search" className="sr-only">
                Cari peserta, hadis harian, sesi refleksi
              </label>
              <input
                id="admin-search"
                type="search"
                placeholder="Cari peserta, hadis harian, sesi refleksi..."
                className="t-body-sm w-full rounded-full bg-canvas-cream py-2.5 pr-4 pl-11 text-on-surface outline-none transition-all placeholder:text-text-muted focus-visible:ring-1 focus-visible:ring-sage-medium"
              />
            </form>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <div className="hidden items-center gap-2 rounded-full bg-sage-tint px-3.5 py-1.5 xl:flex">
              <span className="size-2 rounded-full bg-primary" />
              <span className="t-label-sm text-on-primary-fixed-variant">Cohort 04 — Young Marriage</span>
            </div>
            <button
              type="button"
              aria-label="Notifikasi"
              onClick={() => showToast("Notifikasi akan hadir pada fase berikutnya ✨")}
              className="relative rounded-full bg-canvas-cream p-2.5 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
            >
              <Icon name="notifications" size={20} />
              <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-accent-coral ring-2 ring-surface" />
            </button>
            <button
              type="button"
              onClick={() => openNudge()}
              className="t-label-md flex items-center gap-2 rounded-full bg-primary px-3 py-2.5 text-on-primary shadow-sm transition-colors hover:bg-primary-container sm:px-4"
            >
              <Icon name="send" size={18} />
              <span className="hidden sm:inline">Kirim Nudge</span>
              <span className="sr-only sm:hidden">Kirim Nudge</span>
            </button>
            <div className="flex items-center gap-3 sm:pl-3">
              <div className="hidden text-right md:block">
                <p className="t-title-sm leading-tight font-semibold text-on-surface">Ustaz Ahmad &amp; Tim</p>
                <p className="t-label-sm font-normal text-text-muted">Head Facilitator</p>
              </div>
              <Image src="/images/logo-avatar.png" alt="" width={32} height={32} className="hidden size-8 rounded-full object-cover sm:block" />
            </div>
          </div>
        </div>
      </header>

      <main id="konten-admin" className="min-h-dvh bg-surface pt-20 lg:pl-72">
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
