"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { PromptResponse } from "@/data/prompt-responses";
import { Icon } from "../icon";

type Filter = "all" | "done" | "todo";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "done", label: "Sudah mengisi" },
  { value: "todo", label: "Belum mengisi" },
];

export function PromptStats({
  promptId,
  responses,
}: {
  promptId: string;
  responses: PromptResponse[];
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const done = responses.filter((r) => r.answeredAt).length;
  const total = responses.length;
  const rate = total ? Math.round((done / total) * 100) : 0;

  const rows = responses.filter(
    (r) =>
      filter === "all" || (filter === "done" ? r.answeredAt : !r.answeredAt),
  );

  return (
    <div className="space-y-6">
      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total peserta", value: total, tone: "text-on-surface" },
          { label: "Sudah mengisi", value: done, tone: "text-primary" },
          {
            label: "Belum mengisi",
            value: total - done,
            tone: "text-secondary",
          },
          {
            label: "Tingkat respons",
            value: `${rate}%`,
            tone: "text-on-surface",
          },
        ].map((c) => (
          <div
            key={c.label}
            className="rounded-3xl bg-canvas-ivory p-5 shadow-sm"
          >
            <dt className="t-label-sm text-text-muted">{c.label}</dt>
            <dd className={`t-headline-md mt-1 ${c.tone}`}>{c.value}</dd>
          </div>
        ))}
      </dl>

      <div
        role="radiogroup"
        aria-label="Filter peserta"
        className="flex flex-wrap gap-2"
      >
        {FILTERS.map((f) => {
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setFilter(f.value)}
              className={`t-label-md rounded-full px-4 py-2 transition-colors ${
                active
                  ? "bg-primary text-on-primary shadow-sm"
                  : "bg-canvas-ivory text-on-surface hover:bg-surface-container-low"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-3xl bg-canvas-ivory shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">
              Status pengisian prompt per peserta
            </caption>
            <thead>
              <tr className="t-label-sm bg-surface-container-low tracking-wider text-text-muted uppercase">
                <th scope="col" className="py-4 pr-4 pl-6">
                  Peserta
                </th>
                <th scope="col" className="px-4 py-4">
                  Status
                </th>
                <th scope="col" className="px-4 py-4">
                  Waktu Mengisi
                </th>
                <th scope="col" className="py-4 pr-6 pl-4 text-right">
                  Jawaban
                </th>
              </tr>
            </thead>
            <tbody className="t-body-md divide-y divide-surface-container">
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-text-muted"
                  >
                    Tidak ada peserta pada filter ini.
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r.userId} className="align-middle">
                  <td className="py-3.5 pr-4 pl-6">
                    <div className="flex items-center gap-3">
                      {r.avatar ? (
                        <Image
                          src={r.avatar}
                          alt=""
                          width={36}
                          height={36}
                          className="size-9 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <span className="t-label-md flex size-9 shrink-0 items-center justify-center rounded-full bg-sage-tint text-primary">
                          {r.name
                            .split(" ")
                            .slice(0, 2)
                            .map((w) => w[0])
                            .join("")
                            .toUpperCase()}
                        </span>
                      )}
                      <span className="t-title-sm text-on-surface">
                        {r.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`t-label-sm rounded-full px-3 py-1 font-semibold ${
                        r.answeredAt
                          ? "bg-sage-tint text-primary"
                          : "bg-secondary-container text-secondary"
                      }`}
                    >
                      {r.answeredAt ? "Sudah mengisi" : "Belum mengisi"}
                    </span>
                  </td>
                  <td className="t-body-sm px-4 py-3.5 whitespace-nowrap text-text-muted">
                    {r.answeredAt ?? "-"}
                  </td>
                  <td className="py-3.5 pr-6 pl-4 text-right">
                    {r.answeredAt ? (
                      <Link
                        href={`/admin/prompt/${promptId}/statistik/${r.userId}`}
                        className="t-label-md inline-flex items-center gap-1.5 rounded-full bg-surface-container-low px-4 py-2 whitespace-nowrap text-on-surface transition-colors hover:bg-surface-container"
                      >
                        Lihat Jawaban
                        <Icon name="arrow_forward" size={16} />
                      </Link>
                    ) : (
                      <span className="t-body-sm text-text-muted">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
