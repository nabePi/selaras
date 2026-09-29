"use client";

import { useState } from "react";
import { ComingSoonButton } from "./coming-soon-button";
import { Icon } from "./icon";

type Tab = "timeline" | "kalender";

type Props = {
  banners: React.ReactNode;
  calendar: React.ReactNode;
  pending: React.ReactNode;
  feed: React.ReactNode;
};

const TABS: { value: Tab; label: string }[] = [
  { value: "timeline", label: "Timeline Cerita" },
  { value: "kalender", label: "Kalender" },
];

/** Timeline menampilkan kalender + riwayat; tab Kalender memfokuskan ke kalender saja. */
export function JournalTabs({ banners, calendar, pending, feed }: Props) {
  const [tab, setTab] = useState<Tab>("timeline");

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div role="tablist" aria-label="Tampilan jurnal" className="flex rounded-full bg-surface-container-low p-1">
          {TABS.map((t) => {
            const active = tab === t.value;
            return (
              <button
                key={t.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.value)}
                className={`t-title-sm rounded-full px-4 py-1.5 transition-all duration-200 ${
                  active
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
        <ComingSoonButton
          feature="Export PDF"
          className="t-label-md flex items-center gap-1.5 rounded-full bg-surface-container px-4 py-1.5 text-tertiary shadow-sm transition-colors hover:bg-surface-container-high"
        >
          <Icon name="picture_as_pdf" size={18} />
          <span>Export PDF</span>
        </ComingSoonButton>
      </div>

      {banners}
      {calendar}
      {pending}
      {tab === "timeline" && feed}
    </div>
  );
}
