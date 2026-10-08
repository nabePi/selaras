import Link from "next/link";
import { formatDateId } from "@/data/admin-prompts";
import { PROMPT_STATUS, QUESTION_TYPES, isEditable, type JournalPrompt } from "@/data/journal-prompts";
import { Icon } from "../icon";
import { DeletePromptButton } from "./delete-prompt-button";
import { PageHeader, btnPrimary } from "./page-header";
import { promptListHref, type PromptSort as Sort } from "@/lib/prompt-list-url";
import { PageSizeSelect } from "./prompt-list-controls";

const TYPE_BY_VALUE = Object.fromEntries(QUESTION_TYPES.map((t) => [t.value, t]));

/** Nomor halaman yang ditampilkan: pertama, terakhir, dan sekitar halaman aktif; celah jadi null (elipsis). */
function pageNumbers(page: number, count: number): (number | null)[] {
  const keep = new Set([1, count, page - 1, page, page + 1].filter((n) => n >= 1 && n <= count));
  const out: (number | null)[] = [];
  let prev = 0;
  for (const n of [...keep].sort((a, b) => a - b)) {
    if (n - prev > 1) out.push(null);
    out.push(n);
    prev = n;
  }
  return out;
}

export function PromptList({
  prompts,
  responseCounts,
  total,
  sort,
  per,
  page,
  pageCount,
  pageSizes,
}: {
  /** Prompt pada halaman ini (sudah diurutkan). */
  prompts: JournalPrompt[];
  /** Jumlah jawaban peserta per kode prompt (untuk peringatan hapus). */
  responseCounts: Record<string, number>;
  total: number;
  sort: Sort;
  per: number;
  page: number;
  pageCount: number;
  pageSizes: readonly number[];
}) {
  const defaultPer = pageSizes[0];
  const href = (s: Sort, n: number, p: number) => promptListHref(s, n, p, defaultPer);
  const from = total === 0 ? 0 : (page - 1) * per + 1;
  const to = Math.min(page * per, total);
  return (
    <div className="mx-auto w-full max-w-[1720px] space-y-8 px-4 py-8 sm:px-8 lg:p-10">
      <PageHeader
        pill="Prompt Jurnal"
        pulse={false}
        meta={`${total} prompt`}
        title="Kelola Prompt Jurnal"
        description="Prompt yang muncul di halaman tulis jurnal peserta sesuai tanggal yang dijadwalkan."
        actions={
          <Link href="/admin/prompt/baru" className={btnPrimary}>
            <Icon name="add" size={18} />
            <span>Tambah Prompt</span>
          </Link>
        }
      />

      <div className="overflow-hidden rounded-3xl bg-canvas-ivory shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">Daftar prompt jurnal</caption>
            <thead>
              <tr className="t-label-sm bg-surface-container-low tracking-wider text-text-muted uppercase">
                <th scope="col" aria-sort={sort === "asc" ? "ascending" : "descending"} className="py-4 pr-4 pl-6">
                  <Link
                    href={href(sort === "asc" ? "desc" : "asc", per, 1)}
                    title={sort === "asc" ? "Urut dari terbaru" : "Urut dari terlama"}
                    className="inline-flex items-center gap-1 uppercase hover:text-on-surface"
                  >
                    Tanggal Tayang
                    <Icon name={sort === "asc" ? "arrow_upward" : "arrow_downward"} size={14} />
                  </Link>
                </th>
                <th scope="col" className="px-4 py-4">Judul</th>
                <th scope="col" className="px-4 py-4">Pertanyaan</th>
                <th scope="col" className="px-4 py-4">Status</th>
                <th scope="col" className="py-4 pr-6 pl-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="t-body-md divide-y divide-surface-container">
              {prompts.map((p) => {
                const status = PROMPT_STATUS[p.status];
                return (
                  <tr key={p.id} className="align-top">
                    <td className="t-body-sm py-4 pr-4 pl-6 whitespace-nowrap text-on-surface">
                      {formatDateId(p.date)}
                    </td>
                    <td className="px-4 py-4">
                      <p className="t-title-sm text-on-surface">{p.title}</p>
                      <p className="t-body-sm text-text-muted">{p.subtitle}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="t-label-sm mb-1.5 text-text-muted">{p.questions.length} pertanyaan</p>
                      <ul className="flex flex-wrap gap-1.5">
                        {p.questions.map((q) => (
                          <li
                            key={q.id}
                            className="t-label-sm inline-flex items-center gap-1 rounded-full bg-sage-tint px-2.5 py-1 text-primary"
                          >
                            <Icon name={TYPE_BY_VALUE[q.type].icon} size={14} />
                            {TYPE_BY_VALUE[q.type].label}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`t-label-sm rounded-full px-3 py-1 font-semibold ${status.tone}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="py-4 pr-6 pl-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/prompt/${p.id}`}
                          className="t-label-md flex items-center gap-1.5 rounded-full bg-surface-container-low px-4 py-2 whitespace-nowrap text-on-surface transition-colors hover:bg-surface-container"
                        >
                          <Icon name="visibility" size={16} />
                          Lihat
                        </Link>
                        {p.status === "terbit" && (
                          <Link
                            href={`/admin/prompt/${p.id}/statistik`}
                            className="t-label-md flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 whitespace-nowrap text-on-primary shadow-sm transition-colors hover:bg-primary-container"
                          >
                            <Icon name="bar_chart" size={16} />
                            Statistik
                          </Link>
                        )}
                        {isEditable(p) && (
                          <Link
                            href={`/admin/prompt/${p.id}/edit`}
                            className="t-label-md flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 whitespace-nowrap text-on-primary shadow-sm transition-colors hover:bg-primary-container"
                          >
                            <Icon name="edit" size={16} />
                            Edit
                          </Link>
                        )}
                        <DeletePromptButton prompt={p} responseCount={responseCounts[p.id] ?? 0} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-surface-container px-6 py-4">
          <p className="t-label-md text-text-muted" aria-live="polite">
            Menampilkan {from}–{to} dari {total}
          </p>
          <PageSizeSelect value={per} options={pageSizes} sort={sort} />
          {pageCount > 1 && (
            <nav aria-label="Halaman" className="flex items-center gap-1">
              {page > 1 ? (
                <Link href={href(sort, per, page - 1)} aria-label="Halaman sebelumnya" className="rounded-full p-2 text-on-surface hover:bg-surface-container-low">
                  <Icon name="chevron_left" size={18} />
                </Link>
              ) : (
                <span aria-hidden="true" className="rounded-full p-2 text-text-muted opacity-40">
                  <Icon name="chevron_left" size={18} />
                </span>
              )}
              {pageNumbers(page, pageCount).map((n, i) =>
                n === null ? (
                  <span key={`gap-${i}`} aria-hidden="true" className="t-label-md px-1 text-text-muted">
                    …
                  </span>
                ) : (
                  <Link
                    key={n}
                    href={href(sort, per, n)}
                    aria-current={n === page ? "page" : undefined}
                    className={`t-label-md flex size-9 items-center justify-center rounded-full ${n === page ? "bg-primary text-on-primary" : "text-on-surface hover:bg-surface-container-low"}`}
                  >
                    {n}
                  </Link>
                ),
              )}
              {page < pageCount ? (
                <Link href={href(sort, per, page + 1)} aria-label="Halaman berikutnya" className="rounded-full p-2 text-on-surface hover:bg-surface-container-low">
                  <Icon name="chevron_right" size={18} />
                </Link>
              ) : (
                <span aria-hidden="true" className="rounded-full p-2 text-text-muted opacity-40">
                  <Icon name="chevron_right" size={18} />
                </span>
              )}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
