"use client";

import { useRouter } from "next/navigation";
import { promptListHref, type PromptSort } from "@/lib/prompt-list-url";

/** Pilihan jumlah prompt per halaman; berpindah lewat URL (kembali ke halaman 1) agar bisa dibagikan dan tahan refresh. */
export function PageSizeSelect({ value, options, sort }: { value: number; options: readonly number[]; sort: PromptSort }) {
  const router = useRouter();
  return (
    <label className="t-label-md flex items-center gap-2 text-text-muted">
      Tampilkan
      <select
        value={value}
        onChange={(e) => router.push(promptListHref(sort, Number(e.target.value), 1, options[0]))}
        className="t-label-md cursor-pointer rounded-full border border-outline-variant bg-surface px-3 py-1.5 text-on-surface"
      >
        {options.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
      per halaman
    </label>
  );
}
