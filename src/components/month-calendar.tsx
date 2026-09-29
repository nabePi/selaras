"use client";

import Link from "next/link";
import { useState } from "react";
import { CALENDAR_START, CALENDAR_STATUS, type DayStatus } from "@/data/member";
import { Icon } from "./icon";

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
const WEEKDAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

type Cell = { iso: string; day: number; inMonth: boolean };

const pad = (n: number) => String(n).padStart(2, "0");
const toIso = (d: Date) =>
  `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;

/** Grid bulan dengan minggu dimulai Senin, dilengkapi hari bulan sebelum/sesudahnya. */
function buildCells(year: number, month: number): Cell[] {
  const first = new Date(Date.UTC(year, month, 1));
  const lead = (first.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const total = Math.ceil((lead + daysInMonth) / 7) * 7;

  return Array.from({ length: total }, (_, i) => {
    const d = new Date(Date.UTC(year, month, 1 - lead + i));
    return {
      iso: toIso(d),
      day: d.getUTCDate(),
      inMonth: d.getUTCMonth() === month,
    };
  });
}

const CELL = "flex h-10 flex-col items-center justify-center rounded-xl";

function DayCell({ cell, status }: { cell: Cell; status?: DayStatus }) {
  const date = `${cell.day} ${MONTHS[Number(cell.iso.slice(5, 7)) - 1]}`;

  if (!cell.inMonth || !status) {
    return (
      <span className={`${CELL} t-body-sm text-text-muted/40`}>{cell.day}</span>
    );
  }

  switch (status) {
    case "done":
      return (
        <span
          aria-label={`${date}, sudah diisi`}
          className={`${CELL} t-title-sm bg-sage-tint text-primary`}
        >
          <span>{cell.day}</span>
          <Icon name="check" size={11} />
        </span>
      );
    case "pending":
      return (
        <Link
          href="/journal/tulis"
          aria-label={`${date}, tertunda. Lunasi sekarang`}
          className={`${CELL} t-title-sm animate-pulse bg-secondary-container text-on-secondary-container shadow-sm`}
        >
          <span>{cell.day}</span>
          <Icon name="hourglass_top" size={11} />
        </Link>
      );
    case "locked":
      return (
        <span
          aria-label={`${date}, terkunci sampai hari sebelumnya tuntas`}
          className={`${CELL} t-title-sm bg-surface-container-high text-tertiary`}
        >
          <span>{cell.day}</span>
          <Icon name="lock" size={10} />
        </span>
      );
    case "upcoming":
      return (
        <span
          aria-label={`${date}, belum waktunya`}
          className={`${CELL} t-body-sm bg-surface-container-low text-text-muted/60`}
        >
          {cell.day}
        </span>
      );
  }
}

export function MonthCalendar() {
  const [view, setView] = useState(CALENDAR_START);

  function shift(delta: number) {
    setView(({ year, month }) => {
      const d = new Date(Date.UTC(year, month + delta, 1));
      return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
    });
  }

  const cells = buildCells(view.year, view.month);

  return (
    <section
      aria-label="Kalender status pengisian"
      className="flex w-full flex-col gap-4 rounded-2xl bg-surface-container-lowest p-4 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="calendar_month" size={22} className="text-primary" />
          <h2 aria-live="polite" className="t-headline-sm text-on-surface">
            {MONTHS[view.month]} {view.year}
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Bulan sebelumnya"
            onClick={() => shift(-1)}
            className="flex size-8 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-low"
          >
            <Icon name="chevron_left" size={20} />
          </button>
          <button
            type="button"
            aria-label="Bulan berikutnya"
            onClick={() => shift(1)}
            className="flex size-8 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-low"
          >
            <Icon name="chevron_right" size={20} />
          </button>
        </div>
      </div>

      <div aria-hidden="true" className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((d) => (
          <span key={d} className="t-label-sm py-1 text-text-muted">
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center">
        {cells.map((c) => (
          <DayCell key={c.iso} cell={c} status={CALENDAR_STATUS[c.iso]} />
        ))}
      </div>

      <ul className="t-label-sm flex flex-wrap items-center justify-center gap-x-4 gap-y-1 rounded-xl bg-surface-container-low/50 p-2 pt-2 font-medium text-on-surface-variant">
        <li className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-primary-container" />
          Sudah Diisi
        </li>
        <li className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-accent-coral" />
          Tertunda (Pelunasan)
        </li>
        <li className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-canvas-sand" />
          Belum Waktunya / Terkunci
        </li>
      </ul>
    </section>
  );
}
