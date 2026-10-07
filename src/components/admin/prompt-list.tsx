import Link from "next/link";
import { formatDateId } from "@/data/admin-prompts";
import { PROMPT_STATUS, QUESTION_TYPES, isEditable, type JournalPrompt } from "@/data/journal-prompts";
import { Icon } from "../icon";
import { DeletePromptButton } from "./delete-prompt-button";
import { PageHeader, btnPrimary } from "./page-header";

const TYPE_BY_VALUE = Object.fromEntries(QUESTION_TYPES.map((t) => [t.value, t]));

export function PromptList({
  prompts,
  responseCounts,
}: {
  prompts: JournalPrompt[];
  /** Jumlah jawaban peserta per kode prompt (untuk peringatan hapus). */
  responseCounts: Record<string, number>;
}) {
  return (
    <div className="mx-auto w-full max-w-[1720px] space-y-8 px-4 py-8 sm:px-8 lg:p-10">
      <PageHeader
        pill="Prompt Jurnal"
        pulse={false}
        meta={`${prompts.length} prompt`}
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
                <th scope="col" className="py-4 pr-4 pl-6">Tanggal Tayang</th>
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
      </div>
    </div>
  );
}
