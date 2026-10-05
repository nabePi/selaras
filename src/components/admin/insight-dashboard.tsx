import Image from "next/image";
import Link from "next/link";
import { formatDateId } from "@/data/admin-prompts";
import { ASSESSMENT_PARTS, scoreBand } from "@/data/assessment";
import { getInsight } from "@/lib/insight";
import { Icon } from "../icon";
import { PageHeader, btnSoft } from "./page-header";

const fmt = (v: number | null, digits = 1) =>
  v === null ? "-" : v.toFixed(digits);

function Delta({ value }: { value: number | null }) {
  if (value === null)
    return <span className="t-label-sm text-text-muted">-</span>;
  const up = value >= 0;
  return (
    <span
      className={`t-label-sm inline-flex items-center gap-0.5 rounded-full px-2.5 py-0.5 font-semibold ${
        up
          ? "bg-sage-tint text-primary"
          : "bg-secondary-container text-secondary"
      }`}
    >
      <Icon name={up ? "arrow_upward" : "arrow_downward"} size={12} />
      {up ? "+" : ""}
      {value.toFixed(1)}
    </span>
  );
}

function Bar({
  value,
  max,
  tone,
}: {
  value: number | null;
  max: number;
  tone: string;
}) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
      <div
        className={`h-full rounded-full ${tone}`}
        style={{ width: `${value === null ? 0 : (value / max) * 100}%` }}
      />
    </div>
  );
}

function SectionTitle({
  title,
  hint,
  href,
  cta,
}: {
  title: string;
  hint: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 className="t-headline-sm text-on-surface">{title}</h2>
        <p className="t-body-sm text-text-muted">{hint}</p>
      </div>
      {href && cta && (
        <Link
          href={href}
          className="t-label-md flex items-center gap-1 text-primary hover:underline"
        >
          {cta} <Icon name="arrow_forward" size={16} />
        </Link>
      )}
    </div>
  );
}

export function InsightDashboard() {
  const d = getInsight();
  const maxMood = Math.max(1, ...d.moodCounts.map((m) => m.count));
  const hasPre = d.preDone > 0;
  const hasPost = d.postDone > 0;
  const hasJournal = d.promptStats.length > 0;

  const kpis = [
    {
      label: "Pre Assessment",
      value: `${d.preDone}/${d.total}`,
      note: hasPre ? "peserta sudah mengisi" : "belum ada yang mengisi",
      icon: "fact_check",
    },
    {
      label: "Post Assessment",
      value: `${d.postDone}/${d.total}`,
      note: hasPost ? "peserta sudah mengisi" : "belum ada yang mengisi",
      icon: "task_alt",
    },
    {
      label: "Respons Jurnal",
      value: d.journalRate === null ? "-" : `${d.journalRate}%`,
      note: hasJournal
        ? `rata-rata ${d.promptStats.length} prompt terbit`
        : "belum ada prompt terbit",
      icon: "menu_book",
    },
    {
      label: "Mood Dominan",
      value: d.topMood ? `${d.topMood.emoji} ${d.topMood.label}` : "-",
      note: "dari jawaban mood check jurnal",
      icon: "mood",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1720px] space-y-10 px-4 py-8 sm:px-8 lg:p-10">
      <PageHeader
        pill="Insight Peserta"
        pulse={false}
        meta={`${d.total} peserta aktif`}
        title="Insight Peserta"
        description="Ringkasan seluruh peserta yang dihitung dari tiga sumber: Pre Assessment, jawaban prompt jurnal, dan Post Assessment."
      />

      <dl className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="rounded-3xl bg-canvas-ivory p-5 shadow-sm"
          >
            <dt className="t-label-sm flex items-center gap-1.5 text-text-muted">
              <Icon name={k.icon} size={16} className="text-primary" />
              {k.label}
            </dt>
            <dd className="t-headline-md mt-1 text-on-surface">{k.value}</dd>
            <p className="t-label-sm mt-0.5 text-text-muted">{k.note}</p>
          </div>
        ))}
      </dl>

      {(!hasPre || !hasPost || !hasJournal) && (
        <div className="flex items-start gap-3 rounded-3xl bg-sage-tint/60 p-4 shadow-sm">
          <Icon
            name="info"
            size={20}
            className="mt-0.5 shrink-0 text-primary"
          />
          <ul className="t-body-sm space-y-1 text-on-surface">
            {!hasPre && (
              <li>
                Belum ada peserta yang mengisi Pre Assessment. Skor akan tampil
                setelah ada yang mengisi.
              </li>
            )}
            {hasPre && !hasPost && (
              <li>
                Post Assessment belum dibuka atau belum ada yang mengisi, jadi
                yang tampil baru skor Pre. Perubahan Pre → Post muncul setelah
                peserta mengisi Post.
              </li>
            )}
            {!hasJournal && (
              <li>
                Belum ada prompt jurnal yang terbit, jadi insight jurnal belum
                tersedia.
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Pre vs Post */}
      <section className="space-y-4" aria-label="Perubahan Pre ke Post">
        <SectionTitle
          title={hasPost ? "Perubahan Pre → Post" : "Skor Pre Assessment"}
          hint={
            hasPost
              ? `Rata-rata skor (skala 1–5). Perubahan dihitung dari ${d.pairedN} peserta yang mengisi keduanya.`
              : "Rata-rata skor (skala 1–5) dari peserta yang sudah mengisi Pre Assessment."
          }
          href="/admin/assessment/post"
          cta="Kelola Assessment"
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {d.partRows.map((p) => {
            const band =
              p.post !== null
                ? scoreBand(p.post)
                : p.pre !== null
                  ? scoreBand(p.pre)
                  : null;
            return (
              <div
                key={p.part}
                className="space-y-3 rounded-3xl bg-canvas-ivory p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <h3 className="t-title-md text-on-surface">
                    {ASSESSMENT_PARTS[p.part].title}
                  </h3>
                  {hasPost && <Delta value={p.delta} />}
                </div>
                <div className="flex gap-8">
                  <div>
                    <p className="t-label-sm text-text-muted">Pre</p>
                    <p className="t-headline-md text-on-surface">
                      {fmt(p.pre)}
                    </p>
                  </div>
                  {hasPost && (
                    <div>
                      <p className="t-label-sm text-text-muted">Post</p>
                      <p className="t-headline-md text-on-surface">
                        {fmt(p.post)}
                      </p>
                    </div>
                  )}
                </div>
                {band && (
                  <span
                    className={`t-label-sm inline-block rounded-full px-3 py-1 font-semibold ${band.tone}`}
                  >
                    {band.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="overflow-hidden rounded-3xl bg-canvas-ivory shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">
                Skor Pre dan Post per dimensi
              </caption>
              <thead>
                <tr className="t-label-sm bg-surface-container-low tracking-wider text-text-muted uppercase">
                  <th scope="col" className="py-3 pr-4 pl-6">
                    Dimensi
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Bagian
                  </th>
                  <th scope="col" className="min-w-56 px-4 py-3">
                    Pre
                  </th>
                  {hasPost && (
                    <th scope="col" className="min-w-56 px-4 py-3">
                      Post
                    </th>
                  )}
                  {hasPost && (
                    <th scope="col" className="py-3 pr-6 pl-4 text-right">
                      Perubahan
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {d.dimensionRows.map((r) => (
                  <tr key={r.dimension} className="align-middle">
                    <td className="t-title-sm py-3 pr-4 pl-6 text-on-surface">
                      {r.dimension}
                    </td>
                    <td className="t-body-sm px-4 py-3 text-text-muted">
                      {ASSESSMENT_PARTS[r.part].title}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Bar value={r.pre} max={5} tone="bg-sage-medium" />
                        <span className="t-label-md w-8 shrink-0 text-on-surface">
                          {fmt(r.pre)}
                        </span>
                      </div>
                    </td>
                    {hasPost && (
                      <>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Bar value={r.post} max={5} tone="bg-primary" />
                            <span className="t-label-md w-8 shrink-0 text-on-surface">
                              {fmt(r.post)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 pr-6 pl-4 text-right">
                          <Delta value={r.delta} />
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Jurnal */}
      <section className="space-y-4" aria-label="Jawaban prompt jurnal">
        <SectionTitle
          title="Jawaban Prompt Jurnal"
          hint="Keterlibatan dan kondisi peserta dari prompt yang sudah terbit."
          href="/admin/prompt"
          cta="Kelola Prompt"
        />
        {!hasJournal ? (
          <p className="t-body-md rounded-3xl bg-canvas-ivory p-6 text-text-muted shadow-sm">
            Belum ada prompt yang terbit. Partisipasi, sebaran mood, dan
            rata-rata skala akan tampil setelah peserta menjawab prompt jurnal.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div className="space-y-4 rounded-3xl bg-canvas-ivory p-5 shadow-sm">
              <h3 className="t-title-md text-on-surface">
                Partisipasi per Prompt
              </h3>
              <ul className="space-y-3">
                {d.promptStats.map((p) => (
                  <li key={p.id} className="space-y-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <Link
                        href={`/admin/prompt/${p.id}/statistik`}
                        className="t-title-sm text-on-surface hover:underline"
                      >
                        {p.title}
                      </Link>
                      <span className="t-label-sm shrink-0 text-text-muted">
                        {p.done}/{p.total}
                      </span>
                    </div>
                    <Bar value={p.done} max={p.total} tone="bg-primary" />
                    <p className="t-label-sm text-text-muted">
                      {formatDateId(p.date)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4 rounded-3xl bg-canvas-ivory p-5 shadow-sm">
              <h3 className="t-title-md text-on-surface">Sebaran Mood</h3>
              <ul className="space-y-3">
                {d.moodCounts.map((m) => (
                  <li key={m.label} className="flex items-center gap-3">
                    <span aria-hidden="true" className="text-xl">
                      {m.emoji}
                    </span>
                    <span className="t-label-md w-20 shrink-0 text-on-surface">
                      {m.label}
                    </span>
                    <Bar value={m.count} max={maxMood} tone="bg-primary" />
                    <span className="t-label-md w-6 shrink-0 text-right text-on-surface">
                      {m.count}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4 rounded-3xl bg-canvas-ivory p-5 shadow-sm">
              <h3 className="t-title-md text-on-surface">
                Rata-rata Skala 1–10
              </h3>
              {d.scaleRows.length === 0 ? (
                <p className="t-body-sm text-text-muted">
                  Belum ada pertanyaan skala yang terjawab.
                </p>
              ) : (
                <ul className="space-y-3">
                  {d.scaleRows.map((s) => (
                    <li key={s.label} className="space-y-1">
                      <p className="t-body-sm text-on-surface">{s.label}</p>
                      <div className="flex items-center gap-3">
                        <Bar value={s.avg} max={10} tone="bg-primary" />
                        <span className="t-label-md w-10 shrink-0 text-on-surface">
                          {fmt(s.avg)}
                        </span>
                      </div>
                      <p className="t-label-sm text-text-muted">
                        {s.promptTitle} · {s.n} jawaban
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Per peserta */}
      <section className="space-y-4" aria-label="Ringkasan per peserta">
        <SectionTitle
          title="Ringkasan per Peserta"
          hint="Gabungan skor assessment dan keterlibatan jurnal tiap peserta."
        />
        <div className="overflow-hidden rounded-3xl bg-canvas-ivory shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">
                Ringkasan insight per peserta
              </caption>
              <thead>
                <tr className="t-label-sm bg-surface-container-low tracking-wider text-text-muted uppercase">
                  <th scope="col" className="py-4 pr-4 pl-6">
                    Peserta
                  </th>
                  <th scope="col" className="px-4 py-4">
                    Skor Pre
                  </th>
                  {hasPost && (
                    <th scope="col" className="px-4 py-4">
                      Skor Post
                    </th>
                  )}
                  {hasPost && (
                    <th scope="col" className="px-4 py-4">
                      Perubahan
                    </th>
                  )}
                  <th scope="col" className="px-4 py-4">
                    Jurnal Terisi
                  </th>
                  <th scope="col" className="px-4 py-4">
                    Mood Terakhir
                  </th>
                  <th scope="col" className="py-4 pr-6 pl-4">
                    Perlu Perhatian
                  </th>
                </tr>
              </thead>
              <tbody className="t-body-md divide-y divide-surface-container">
                {d.people.map((p) => (
                  <tr key={p.id} className="align-middle">
                    <td className="py-3.5 pr-4 pl-6">
                      <div className="flex items-center gap-3">
                        {p.avatar ? (
                          <Image
                            src={p.avatar}
                            alt=""
                            width={36}
                            height={36}
                            className="size-9 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <span className="t-label-md flex size-9 shrink-0 items-center justify-center rounded-full bg-sage-tint text-primary">
                            {p.name
                              .split(" ")
                              .slice(0, 2)
                              .map((w) => w[0])
                              .join("")
                              .toUpperCase()}
                          </span>
                        )}
                        <span className="t-title-sm text-on-surface">
                          {p.name}
                        </span>
                      </div>
                    </td>
                    <td className="t-body-sm px-4 py-3.5 text-on-surface">
                      {fmt(p.preScore)}
                    </td>
                    {hasPost && (
                      <td className="t-body-sm px-4 py-3.5 text-on-surface">
                        {fmt(p.postScore)}
                      </td>
                    )}
                    {hasPost && (
                      <td className="px-4 py-3.5">
                        <Delta value={p.delta} />
                      </td>
                    )}
                    <td className="t-body-sm px-4 py-3.5 whitespace-nowrap text-on-surface">
                      {hasJournal ? `${p.journalDone}/${p.journalTotal}` : "-"}
                    </td>
                    <td className="t-body-sm px-4 py-3.5 whitespace-nowrap text-on-surface">
                      {p.lastMood ?? "-"}
                    </td>
                    <td className="py-3.5 pr-6 pl-4">
                      {p.flags.length === 0 ? (
                        <span className="t-body-sm text-text-muted">-</span>
                      ) : (
                        <ul className="flex flex-wrap gap-1.5">
                          {p.flags.map((f) => (
                            <li
                              key={f}
                              className="t-label-sm rounded-full bg-secondary-container px-2.5 py-0.5 whitespace-nowrap text-secondary"
                            >
                              {f}
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex justify-end">
          <Link href="/admin/users" className={btnSoft}>
            <Icon name="group" size={18} />
            <span>Lihat Daftar Users</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
