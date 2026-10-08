import type { Metadata } from "next";
import { PromptList } from "@/components/admin/prompt-list";
import { requireAdminPage } from "@/lib/server/session";
import { getResponseCounts, listPrompts } from "@/server/admin/prompts";

export const metadata: Metadata = { title: "Kelola Prompt Jurnal" };

const PAGE_SIZES = [10, 25, 50, 100] as const;

type SearchParams = Promise<{ urut?: string; per?: string; hal?: string }>;

export default async function PromptPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdminPage();
  const sp = await searchParams;
  // Tanggal tayang terbaru dulu bila tidak dipilih; ukuran halaman di luar daftar dipakai bawaan (10).
  const sort = sp.urut === "asc" ? "asc" : "desc";
  const per = PAGE_SIZES.find((n) => n === Number(sp.per)) ?? PAGE_SIZES[0];

  const [all, responseCounts] = await Promise.all([listPrompts(), getResponseCounts()]);
  const sorted = [...all].sort((a, b) => (sort === "asc" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)));
  const pageCount = Math.max(1, Math.ceil(sorted.length / per));
  const page = Math.min(Math.max(1, Math.floor(Number(sp.hal)) || 1), pageCount);

  return (
    <PromptList
      prompts={sorted.slice((page - 1) * per, page * per)}
      responseCounts={responseCounts}
      total={sorted.length}
      sort={sort}
      per={per}
      page={page}
      pageCount={pageCount}
      pageSizes={PAGE_SIZES}
    />
  );
}
