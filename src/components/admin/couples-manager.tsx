"use client";

import { useEffect, useMemo, useState } from "react";
import {
  INITIAL_COUPLES,
  NOW_LABEL,
  TOTAL_DAYS,
  buildLog,
  progressPercent,
  type Couple,
  type CoupleStatus,
} from "@/data/admin-couples";
import { activateCouple, saveCoachNote, sendNudge } from "@/lib/admin-actions";
import { downloadCsv, toCsv } from "@/lib/csv";
import { ComingSoonButton } from "../coming-soon-button";
import { Icon } from "../icon";
import { useToast } from "../toast-provider";
import { AddCoupleDialog, type NewCoupleInput } from "./add-couple-dialog";
import { PageHeader, btnPrimary, btnSoft } from "./page-header";

type Tab = "all" | "pending" | "active" | "backlog" | "alumni";
type GatingFilter = "all" | "ontrack" | "delay1" | "delay2";
type CohortFilter = "all" | "Cohort 04" | "Cohort 03";

const PAGE_SIZE = 7;

const matchesTab = (c: Couple, tab: Tab) =>
  tab === "all" ||
  (tab === "pending" && c.status === "pending") ||
  (tab === "active" && (c.status === "active" || c.status === "backlog")) ||
  (tab === "backlog" && c.status === "backlog") ||
  (tab === "alumni" && c.status === "alumni");

const matchesGating = (c: Couple, g: GatingFilter) =>
  g === "all" ||
  (g === "ontrack" && c.status === "active" && c.delayDays === 0) ||
  (g === "delay1" && c.delayDays === 1) ||
  (g === "delay2" && c.delayDays >= 2);

const AVATAR: Record<CoupleStatus, string> = {
  active: "bg-sage-tint text-primary",
  pending: "bg-secondary-fixed text-on-secondary-fixed-variant",
  backlog: "bg-secondary-container text-secondary",
  alumni: "bg-canvas-sand text-tertiary",
};

const ROW_TONE: Record<CoupleStatus, string> = {
  active: "",
  pending: "bg-accent-coral/5",
  backlog: "bg-secondary-container/20",
  alumni: "opacity-80",
};

const CONTACT_TONE = { ok: "text-primary", pending: "text-secondary", plain: "text-text-muted" } as const;

export function CouplesManager() {
  const { showToast } = useToast();
  const [couples, setCouples] = useState<Couple[]>(INITIAL_COUPLES);
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [cohort, setCohort] = useState<CohortFilter>("all");
  const [gating, setGating] = useState<GatingFilter>("all");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const counts = useMemo(() => {
    const c = { all: couples.length, pending: 0, active: 0, backlog: 0, alumni: 0, shared: 0 };
    for (const x of couples) {
      if (x.status === "pending") c.pending++;
      if (x.status === "active" || x.status === "backlog") c.active++;
      if (x.status === "backlog") c.backlog++;
      if (x.status === "alumni") c.alumni++;
      if (x.sharedWithCoach) c.shared++;
    }
    return c;
  }, [couples]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/-/g, "");
    return couples.filter(
      (c) =>
        matchesTab(c, tab) &&
        matchesGating(c, gating) &&
        (cohort === "all" || c.cohort === cohort) &&
        (!q ||
          [c.name, c.shortName, c.phone, c.id, c.email ?? ""].some((v) =>
            v.toLowerCase().replace(/-/g, "").includes(q),
          )),
    );
  }, [couples, tab, gating, cohort, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const selected = couples.find((c) => c.id === selectedId) ?? null;

  useEffect(() => {
    if (!selectedId) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSelectedId(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId]);

  const privacyPct = Math.round((counts.shared / Math.max(counts.all, 1)) * 100);

  function resetPage<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setPage(1);
    };
  }

  async function activate(c: Couple) {
    setBusy(c.id);
    const result = await activateCouple(c.id);
    setBusy(null);
    if (!result.ok) return showToast(result.error);
    setCouples((list) =>
      list.map((x) =>
        x.id === c.id
          ? {
              ...x,
              status: "active",
              day: 1,
              startLabel: NOW_LABEL,
              contactNote: { icon: "check_circle", label: "WA Aktif", tone: "ok" },
              activationLog: `Diaktifkan oleh Admin pada ${NOW_LABEL}. Modul pembuka langsung terbuka.`,
            }
          : x,
      ),
    );
    showToast(`Akun untuk ${c.shortName} berhasil diaktifkan! Titik gating H-1 telah dibuka.`, { tone: "success" });
  }

  async function nudge(c: Couple) {
    setBusy(c.id);
    const result = await sendNudge({ kind: "couple", id: c.id, name: c.shortName });
    setBusy(null);
    if (!result.ok) return showToast(result.error);
    showToast(`Nudge afeksi dikirim ke ${c.shortName} (${c.phone}).`, { tone: "success" });
  }

  async function saveNote(c: Couple) {
    const text = notes[c.id] ?? c.coachNote;
    const result = await saveCoachNote(c.id, text);
    if (!result.ok) return showToast(result.error);
    setCouples((list) => list.map((x) => (x.id === c.id ? { ...x, coachNote: text } : x)));
    showToast("Catatan pendamping tersimpan.", { tone: "success" });
  }

  function exportCsv() {
    const csv = toCsv(
      ["ID", "Nama", "Telepon", "Email", "Cohort", "Status", "Hari", "Total Hari", "Tertunda (hari)", "Bagikan ke Coach"],
      filtered.map((c) => [c.id, c.name, c.phone, c.email ?? "", c.cohort, c.status, c.day, c.totalDays, c.delayDays, c.sharedWithCoach ? "ya" : "tidak"]),
    );
    downloadCsv("peserta-selaras-life.csv", csv);
    showToast(`Laporan CSV diunduh (${filtered.length} pasutri sesuai filter).`, { tone: "success" });
  }

  function handleAdded(input: NewCoupleInput) {
    const nextNum = Math.max(...couples.map((c) => Number(c.id.slice(-3)))) + 1;
    const wifeName = input.wife.split(" ")[0];
    const husbandName = input.husband.split(" ")[0];
    const couple: Couple = {
      id: `SL-2026-${String(nextNum).padStart(3, "0")}`,
      name: `${input.wife} & ${input.husband}`,
      shortName: `${wifeName} & ${husbandName}`,
      initials: `${wifeName[0]}${husbandName[0]}`.toUpperCase(),
      phone: input.whatsapp,
      cohort: input.cohort,
      status: input.activateNow ? "active" : "pending",
      subtitle: "Ditambahkan manual oleh admin",
      contactNote: input.activateNow
        ? { icon: "check_circle", label: "WA Aktif", tone: "ok" }
        : { icon: "pending", label: "Menunggu verifikasi", tone: "pending" },
      startLabel: input.activateNow ? NOW_LABEL : "Menunggu titik mulai gating",
      day: input.activateNow ? 1 : 0,
      totalDays: TOTAL_DAYS,
      delayDays: 0,
      sharedWithCoach: true,
      activationLog: input.activateNow
        ? `Ditambahkan & diaktifkan manual pada ${NOW_LABEL}.`
        : "Ditambahkan manual. Menunggu aktivasi.",
      coachNote: "",
    };
    setCouples((list) => [couple, ...list]);
    setTab("all");
    setCohort("all");
    setGating("all");
    setQuery("");
    setPage(1);
    setSelectedId(couple.id);
    showToast(`${couple.shortName} berhasil didaftarkan dan data siap diproses.`, { tone: "success" });
  }

  const TABS: { value: Tab; label: string; count: number; badge?: string }[] = [
    { value: "all", label: "Semua", count: counts.all },
    { value: "pending", label: "Menunggu Aktivasi", count: counts.pending, badge: "bg-accent-coral text-surface-container-lowest" },
    { value: "active", label: "Aktif Berjalan", count: counts.active },
    { value: "backlog", label: "Backlog Tertahan", count: counts.backlog, badge: "bg-secondary-fixed text-on-secondary-fixed-variant" },
    { value: "alumni", label: "Alumni", count: counts.alumni },
  ];

  return (
    <div className="flex w-full flex-col space-y-8 px-4 py-8 sm:px-8">
      <PageHeader
        pill="KONSUL PENDAMPINGAN AKTIF"
        meta="Pembaruan Sinkron: Hari ini, 09:42 WIB"
        title="Aktivasi & Manajemen Pasutri"
        description={
          <>
            Kelola status aktivasi pendaftaran peserta program, kendalikan titik awal{" "}
            <span className="font-medium text-primary">sequential gating</span>, pantau backlog pengisian jurnal
            harian, dan kirimkan sentuhan pendampingan berbasis afeksi Islami tanpa menghakimi.
          </>
        }
        actions={
          <>
            <button type="button" onClick={exportCsv} className={btnSoft}>
              <Icon name="download" size={19} className="text-text-muted" />
              <span>Unduh Laporan (CSV)</span>
            </button>
            <button type="button" onClick={() => document.getElementById("filter-cohort")?.focus()} className={btnSoft}>
              <Icon name="tune" size={19} className="text-text-muted" />
              <span>Filter Cohort</span>
            </button>
            <button type="button" onClick={() => setAddOpen(true)} className={btnPrimary}>
              <Icon name="person_add" size={19} />
              <span>+ Tambah Pasutri Manual</span>
            </button>
          </>
        }
      />

      {/* KPI */}
      <section aria-label="Ringkasan" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl bg-canvas-ivory p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <span className="t-label-sm mb-1 block tracking-wider text-text-muted uppercase">Total Pendaftar</span>
              <div className="flex items-baseline gap-2">
                <span className="t-display text-on-surface">{counts.all}</span>
                <span className="t-title-sm text-text-muted">Pasutri</span>
              </div>
            </div>
            <span className="flex size-10 items-center justify-center rounded-2xl bg-sage-tint text-primary"><Icon name="diversity_1" size={22} /></span>
          </div>
          <div className="t-body-sm mt-4 flex flex-wrap items-center gap-x-2 pt-3 text-text-muted">
            <span className="font-semibold text-primary">{counts.active} Aktif</span><span>•</span>
            <span className="font-semibold text-accent-coral">{counts.pending} Menunggu</span><span>•</span>
            <span>{counts.alumni} Alumni C3</span>
          </div>
        </div>

        <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl bg-secondary-container/40 p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <span className="t-label-sm mb-1 block tracking-wider text-secondary uppercase">Backlog Gating Kritis (&gt;2 Hari)</span>
              <div className="flex items-baseline gap-2">
                <span className="t-display text-secondary">{counts.backlog}</span>
                <span className="t-title-sm text-secondary">Pasang</span>
              </div>
            </div>
            <span className="flex size-10 items-center justify-center rounded-2xl bg-secondary-container text-secondary"><Icon name="schedule" size={22} /></span>
          </div>
          <div className="mt-4 flex items-center justify-between pt-3">
            <span className="t-label-sm text-on-secondary-container">Memerlukan sentuhan afeksi coach</span>
            <Icon name="priority_high" size={18} className="animate-bounce text-accent-coral" />
          </div>
        </div>

        <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl bg-canvas-ivory p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <span className="t-label-sm mb-1 block tracking-wider text-text-muted uppercase">Rata-rata Catch-up Gating</span>
              <div className="flex items-baseline gap-2">
                <span className="t-display text-on-surface">1.4</span>
                <span className="t-title-sm text-text-muted">Hari Selesai</span>
              </div>
            </div>
            <span className="flex size-10 items-center justify-center rounded-2xl bg-sage-tint text-primary"><Icon name="task_alt" size={22} /></span>
          </div>
          <div className="mt-4 flex items-center gap-2 pt-3">
            <svg aria-hidden="true" className="h-4 w-12 text-primary" fill="none" viewBox="0 0 50 16"><path d="M1 12 Q 12 3, 25 8 T 49 2" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" /></svg>
            <span className="t-label-sm text-primary">+18% Lebih Cepat dari C3</span>
          </div>
        </div>

        <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl bg-canvas-ivory p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <span className="t-label-sm mb-1 block tracking-wider text-text-muted uppercase">Izin Privasi Dibagikan ke Coach</span>
              <div className="flex items-baseline gap-2">
                <span className="t-display text-on-surface">{privacyPct}%</span>
                <span className="t-title-sm text-text-muted">Pasutri</span>
              </div>
            </div>
            <span className="flex size-10 items-center justify-center rounded-2xl bg-accent-mint text-primary"><Icon name="lock_open_right" size={22} /></span>
          </div>
          <div className="t-body-sm mt-4 flex items-center justify-between pt-3 text-text-muted">
            <span>{100 - privacyPct}% Mode Private Penuh</span>
            <span className="size-2 rounded-full bg-sage-medium" />
          </div>
        </div>
      </section>

      {/* Filter bar */}
      <section aria-label="Filter peserta" className="flex flex-col justify-between gap-4 rounded-3xl bg-canvas-cream p-3 shadow-sm 2xl:flex-row 2xl:items-center">
        <div role="tablist" aria-label="Status peserta" className="flex max-w-full items-center gap-1.5 overflow-x-auto rounded-full bg-surface p-1">
          {TABS.map((t) => {
            const active = tab === t.value;
            return (
              <button
                key={t.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => resetPage(setTab)(t.value)}
                className={`t-title-sm flex items-center gap-1.5 rounded-full px-4 py-2 whitespace-nowrap transition-colors ${
                  active ? "bg-primary-container text-on-primary-container shadow-sm" : "text-on-surface-variant hover:bg-canvas-ivory"
                }`}
              >
                {t.label}
                {t.badge && t.count > 0 && !active ? (
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${t.badge}`}>{t.count}</span>
                ) : (
                  <span>({t.count})</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Icon name="search" size={18} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-text-muted" />
            <label htmlFor="filter-search" className="sr-only">Cari peserta</label>
            <input
              id="filter-search"
              type="search"
              value={query}
              onChange={(e) => resetPage(setQuery)(e.target.value)}
              placeholder="Cari suami, istri, WA, ID..."
              className="t-body-sm w-full rounded-full bg-surface py-2 pr-4 pl-10 text-on-surface shadow-sm outline-none placeholder:text-text-muted focus-visible:ring-1 focus-visible:ring-sage-medium"
            />
          </div>
          <SelectPill id="filter-cohort" label="Cohort" value={cohort} onChange={(v) => resetPage(setCohort)(v as CohortFilter)}
            options={[["all", "Semua Cohort"], ["Cohort 04", "Cohort 04 (Aktif)"], ["Cohort 03", "Cohort 03 (Alumni)"]]} />
          <SelectPill id="filter-gating" label="Status gating" value={gating} onChange={(v) => resetPage(setGating)(v as GatingFilter)}
            options={[["all", "Status Gating"], ["ontrack", "Lancar (On-track)"], ["delay1", "Tertunda 1 Hari"], ["delay2", "Tertunda ≥2 Hari"]]} />
        </div>
      </section>

      {/* Tabel + drawer */}
      <div className="relative flex flex-col items-start gap-6 2xl:flex-row">
        <div className="w-full flex-1 overflow-hidden rounded-3xl bg-canvas-ivory shadow-sm">
          <div className="relative overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">Daftar pasutri peserta program</caption>
              <thead>
                <tr className="t-label-sm bg-surface-container-low tracking-wider text-text-muted uppercase">
                  <th scope="col" className="py-4 pr-4 pl-6">Pasangan Peserta</th>
                  <th scope="col" className="px-4 py-4">Kontak &amp; Verifikasi</th>
                  <th scope="col" className="px-4 py-4">Cohort &amp; Titik Mulai</th>
                  <th scope="col" className="px-4 py-4">Progres Gating</th>
                  <th scope="col" className="px-4 py-4">Status Akun</th>
                  <th scope="col" className="py-4 pr-6 pl-4 text-right">Aksi Tindakan</th>
                </tr>
              </thead>
              <tbody className="t-body-md divide-y divide-surface-container">
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                      Tidak ada pasutri yang cocok dengan filter ini.
                    </td>
                  </tr>
                )}
                {rows.map((c) => (
                  <CoupleRow
                    key={c.id}
                    c={c}
                    selected={selected?.id === c.id}
                    busy={busy === c.id}
                    onSelect={() => setSelectedId(c.id)}
                    onActivate={() => activate(c)}
                    onNudge={() => nudge(c)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 bg-surface-container-low p-4 px-6 sm:flex-row">
            <span className="t-body-sm text-text-muted">
              Menampilkan <strong>{rows.length}</strong> dari <strong>{filtered.length}</strong> pasangan
              {filtered.length !== counts.all && <> (total terdaftar <strong>{counts.all}</strong>)</>}
            </span>
            <nav aria-label="Halaman" className="flex items-center gap-2">
              <PageButton label="Halaman sebelumnya" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>
                <Icon name="chevron_left" size={18} />
              </PageButton>
              {pageWindow(safePage, pageCount).map((p, i) =>
                p === "…" ? (
                  <span key={`gap-${i}`} className="px-1 text-text-muted">…</span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    aria-current={p === safePage ? "page" : undefined}
                    onClick={() => setPage(p)}
                    className={`t-title-sm flex size-8 items-center justify-center rounded-full transition-colors ${
                      p === safePage ? "bg-primary-container text-on-primary-container" : "text-on-surface-variant hover:bg-surface"
                    }`}
                  >
                    {p}
                  </button>
                ),
              )}
              <PageButton label="Halaman berikutnya" disabled={safePage >= pageCount} onClick={() => setPage(safePage + 1)}>
                <Icon name="chevron_right" size={18} />
              </PageButton>
            </nav>
          </div>
        </div>

        {selected && (
          <CoupleDrawer
            key={selected.id}
            couple={selected}
            note={notes[selected.id] ?? selected.coachNote}
            onNote={(v) => setNotes((n) => ({ ...n, [selected.id]: v }))}
            onSaveNote={() => saveNote(selected)}
            onNudge={() => nudge(selected)}
            onClose={() => setSelectedId(null)}
          />
        )}
      </div>

      <AddCoupleDialog open={addOpen} onClose={() => setAddOpen(false)} onAdded={handleAdded} />
    </div>
  );
}

function pageWindow(current: number, total: number): (number | "…")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, current, current - 1, current + 1].filter((p) => p >= 1 && p <= total));
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("…");
    out.push(p);
  });
  return out;
}

function PageButton({ label, disabled, onClick, children }: { label: string; disabled: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-8 items-center justify-center rounded-full bg-surface text-text-muted transition-colors hover:text-on-surface disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function SelectPill({ id, label, value, onChange, options }: { id: string; label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">{label}</label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="t-body-sm cursor-pointer appearance-none rounded-full bg-surface py-2 pr-9 pl-4 text-on-surface shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-sage-medium"
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
      <Icon name="expand_more" size={16} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-text-muted" />
    </div>
  );
}

function CoupleRow({ c, selected, busy, onSelect, onActivate, onNudge }: { c: Couple; selected: boolean; busy: boolean; onSelect: () => void; onActivate: () => void; onNudge: () => void }) {
  const pct = progressPercent(c);
  const backlog = c.status === "backlog";
  const pending = c.status === "pending";
  const alumni = c.status === "alumni";

  return (
    <tr
      onClick={onSelect}
      className={`group cursor-pointer transition-colors hover:bg-surface/60 ${ROW_TONE[c.status]} ${selected ? "bg-surface/80 shadow-[inset_3px_0_0_var(--color-primary)]" : ""}`}
    >
      <td className="py-4 pr-4 pl-6">
        <div className="flex items-center gap-3.5">
          <span className={`t-title-sm flex size-10 shrink-0 items-center justify-center rounded-2xl font-semibold ${AVATAR[c.status]}`}>{c.initials}</span>
          <div>
            <div className="t-title-sm flex items-center gap-1.5 font-semibold text-on-surface">
              {c.name}
              {c.status === "active" && (
                <Icon name={c.sharedWithCoach ? "visibility" : "lock"} size={16} className={c.sharedWithCoach ? "text-primary" : "text-text-muted"} />
              )}
              {pending && <span className="rounded bg-accent-coral px-1.5 py-0.5 text-[10px] font-semibold text-on-surface">Baru</span>}
              {backlog && <Icon name="flag" size={16} className="text-secondary" />}
            </div>
            <span className="t-body-sm text-text-muted">ID: {c.id} • {c.subtitle}</span>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-col">
          <span className="t-body-sm font-medium text-on-surface">{c.phone}</span>
          <span className={`t-label-sm flex items-center gap-1 font-normal ${CONTACT_TONE[c.contactNote.tone]}`}>
            {c.contactNote.tone !== "plain" && <Icon name={c.contactNote.icon} size={13} className={c.contactNote.tone === "pending" ? "text-accent-coral" : ""} />}
            {c.contactNote.label}
          </span>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-col">
          <span className="t-body-sm font-medium text-on-surface">
            {c.cohort} {alumni ? "(Lulus)" : "(Young Marriage)"}
          </span>
          {pending ? (
            <span className="t-label-sm font-medium text-accent-coral">Menunggu Titik Mulai Gating</span>
          ) : alumni ? (
            <span className="t-label-sm font-normal text-text-muted">Skor Post-Test: {c.postTest}/100</span>
          ) : (
            <span className="t-label-sm font-normal text-text-muted">Mulai: {c.startLabel}</span>
          )}
        </div>
      </td>
      <td className="px-4 py-4">
        {pending ? (
          <div className="w-36 space-y-1">
            <span className="t-label-sm font-normal text-text-muted">Gating Terkunci (H-0)</span>
            <div className="h-2 w-full rounded-full bg-surface-container" />
            <span className="text-[11px] text-text-muted">Akses belum dibuka</span>
          </div>
        ) : (
          <div className="w-36 space-y-1.5">
            <div className="t-label-sm flex justify-between">
              <span className={`font-semibold ${backlog ? "font-bold text-secondary" : alumni ? "text-tertiary" : "text-primary"}`}>
                {backlog ? `Tertahan di H-${c.day}` : alumni ? `${c.day} / ${c.totalDays} Hari` : `Hari ${c.day} dari ${c.totalDays}`}
              </span>
              <span className={`font-semibold ${backlog ? "text-secondary" : alumni ? "text-tertiary" : "font-normal text-text-muted"}`}>{pct}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container">
              <div className={`h-full rounded-full ${backlog ? "bg-secondary" : alumni ? "bg-tertiary" : "bg-primary"}`} style={{ width: `${pct}%` }} />
            </div>
            <span className={`inline-block text-[11px] font-medium ${backlog ? "text-secondary" : alumni ? "text-tertiary" : c.delayDays ? "text-tertiary" : "text-primary"}`}>
              {backlog ? c.gatingNote : alumni ? "Program Tuntas Penuh" : c.delayDays ? `Tertunda ${c.delayDays} Hari` : "Gating Lancar"}
            </span>
          </div>
        )}
      </td>
      <td className="px-4 py-4">
        {pending ? (
          <button
            type="button"
            disabled={busy}
            onClick={(e) => { e.stopPropagation(); onActivate(); }}
            className="t-label-md inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-on-primary shadow-sm transition-all hover:bg-primary-container active:scale-95 disabled:opacity-70"
          >
            <Icon name="lock_open" size={16} />
            {busy ? "Mengaktifkan..." : "Aktifkan Akses"}
          </button>
        ) : backlog ? (
          <span className="t-label-sm inline-flex items-center gap-1.5 rounded-full bg-secondary-fixed px-3 py-1 font-semibold text-on-secondary-fixed-variant">
            <span className="size-1.5 animate-ping rounded-full bg-secondary" />
            Butuh Nudge Coach
          </span>
        ) : alumni ? (
          <span className="t-label-sm inline-flex items-center gap-1.5 rounded-full bg-canvas-sand/60 px-3 py-1 font-semibold text-tertiary">
            <Icon name="workspace_premium" size={14} />
            Alumni Cohort 3
          </span>
        ) : (
          <span className="t-label-sm inline-flex items-center gap-1.5 rounded-full bg-sage-tint px-3 py-1 font-semibold text-primary">
            <span className="size-1.5 rounded-full bg-primary" />
            Aktif Program
          </span>
        )}
      </td>
      <td className="py-4 pr-6 pl-4 text-right">
        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          {backlog ? (
            <button type="button" disabled={busy} onClick={onNudge} className="t-label-md flex items-center gap-1 rounded-full bg-secondary px-3.5 py-1.5 text-on-secondary shadow-sm transition-all hover:bg-on-secondary-fixed-variant disabled:opacity-70">
              <Icon name="favorite" size={16} />
              {busy ? "Mengirim..." : "Nudge Afeksi"}
            </button>
          ) : pending ? (
            <ComingSoonButton feature="Pemeriksaan bukti pembayaran" className="t-label-md rounded-full bg-surface-container-low px-3 py-1.5 text-on-surface transition-colors hover:bg-surface">
              Periksa Bukti
            </ComingSoonButton>
          ) : alumni ? (
            <ComingSoonButton feature="Arsip alumni" className="t-label-md rounded-full bg-surface-container-low px-3 py-1.5 text-on-surface transition-colors hover:bg-surface">
              Arsip
            </ComingSoonButton>
          ) : (
            <button type="button" onClick={onSelect} className="t-label-md rounded-full bg-surface-container-low px-3 py-1.5 text-on-surface transition-colors hover:bg-surface">
              Detail<span className="sr-only"> {c.shortName}</span>
            </button>
          )}
          {!pending && !alumni && (
            <ComingSoonButton feature="Menu aksi peserta" aria-label={`Menu aksi ${c.shortName}`} className="rounded-full p-1.5 text-text-muted transition-colors hover:bg-surface-container-low">
              <Icon name="more_vert" size={20} />
            </ComingSoonButton>
          )}
        </div>
      </td>
    </tr>
  );
}

const LOG_DOT = { primary: "bg-primary", soft: "bg-primary-container", alert: "bg-secondary-fixed" } as const;

function CoupleDrawer({ couple: c, note, onNote, onSaveNote, onNudge, onClose }: { couple: Couple; note: string; onNote: (v: string) => void; onSaveNote: () => void; onNudge: () => void; onClose: () => void }) {
  const statusLabel =
    c.status === "pending" ? "Menunggu Aktivasi" : c.status === "backlog" ? "Butuh Nudge Coach" : c.status === "alumni" ? "Alumni Terbimbing" : c.delayDays ? `Tertunda ${c.delayDays} Hari` : "Aktif On-track";
  const progressLabel = c.status === "pending" ? "Belum Mulai" : c.status === "alumni" ? `${c.day}/${c.totalDays} Selesai` : `Hari ${c.day} dari ${c.totalDays} Hari`;

  return (
    <aside aria-label={`Audit detail ${c.shortName}`} className="fixed top-20 right-0 bottom-0 z-40 w-full max-w-md space-y-6 overflow-y-auto bg-canvas-ivory p-6 shadow-[-8px_0_30px_rgba(92,75,62,0.12)] sm:rounded-tl-3xl 2xl:static 2xl:z-auto 2xl:w-96 2xl:max-w-none 2xl:shrink-0 2xl:overflow-visible 2xl:rounded-3xl 2xl:shadow-md">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="t-label-sm font-semibold tracking-wider text-primary uppercase">Audit Detail Pasutri</span>
          <h2 className="t-headline-sm text-on-surface">{c.name}</h2>
          <p className="t-body-sm text-text-muted">{c.cohort} • ID: {c.id} • {c.phone}</p>
        </div>
        <button type="button" aria-label="Tutup panel audit" onClick={onClose} className="rounded-full p-1.5 text-text-muted transition-colors hover:bg-surface">
          <Icon name="close" size={20} />
        </button>
      </div>

      <div className="space-y-3 rounded-2xl bg-canvas-cream p-4">
        <div className="t-body-sm flex items-center justify-between">
          <span className="text-text-muted">Status Akses Gating:</span>
          <span className="font-semibold text-primary">{statusLabel}</span>
        </div>
        <div className="t-body-sm flex items-center justify-between">
          <span className="text-text-muted">Progres Saat Ini:</span>
          <span className="font-semibold text-on-surface">{progressLabel}</span>
        </div>
        <div className="flex gap-2 pt-2">
          <ComingSoonButton feature="Reset titik hari" className="t-label-md flex-1 rounded-full bg-sage-tint px-3 py-2 text-center text-primary transition-colors hover:bg-primary-fixed">
            Reset Titik Hari
          </ComingSoonButton>
          <button type="button" onClick={onNudge} className="t-label-md flex-1 rounded-full bg-primary px-3 py-2 text-center text-on-primary transition-colors hover:bg-primary-container">
            Kirim Reminder
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="t-title-sm font-semibold text-on-surface">Riwayat Gating &amp; Log Versi</h3>
          <span className="t-label-sm font-normal text-text-muted">Autosave • v2.4</span>
        </div>
        <ol className="relative space-y-5 pl-6 before:absolute before:top-2 before:bottom-2 before:left-2 before:w-0.5 before:bg-canvas-sand">
          {buildLog(c).map((e, i) => (
            <li key={i} className="relative">
              <span className={`absolute top-1 -left-6 size-3 rounded-full ring-4 ring-canvas-ivory ${LOG_DOT[e.tone]}`} />
              <div className="space-y-0.5">
                <div className="flex items-center justify-between gap-2">
                  <span className={`t-title-sm font-medium ${e.tone === "alert" ? "text-secondary" : "text-on-surface"}`}>{e.title}</span>
                  <span className="t-label-sm shrink-0 font-normal text-text-muted">{e.time}</span>
                </div>
                <p className="t-body-sm text-text-muted">{e.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="space-y-2 rounded-2xl bg-surface p-4">
        <label htmlFor="coach-note" className="t-label-sm flex items-center gap-2 font-normal text-text-muted">
          <Icon name="edit_note" size={16} className="text-primary" />
          <span>Catatan Rahasia Pendamping (Coach Only)</span>
        </label>
        <textarea
          id="coach-note"
          rows={3}
          value={note}
          onChange={(e) => onNote(e.target.value)}
          placeholder="Tuliskan catatan observasi emosional atau kendala pasutri ini..."
          className="t-body-sm w-full resize-none border-none bg-transparent text-on-surface outline-none placeholder:text-text-muted/60"
        />
        <div className="flex justify-end">
          <button type="button" onClick={onSaveNote} className="t-label-sm rounded-full bg-sage-tint px-3 py-1 text-primary transition-colors hover:bg-primary-fixed">
            Simpan Catatan
          </button>
        </div>
      </div>
    </aside>
  );
}
