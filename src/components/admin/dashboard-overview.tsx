import Link from "next/link";
import { formatDateId } from "@/data/admin-prompts";
import { ASSESSMENT_PARTS } from "@/data/assessment";
import { getDashboard } from "@/server/admin/dashboard";
import { Icon } from "../icon";
import { PageHeader } from "./page-header";

const fmt = (v: number | null) => (v === null ? "-" : v.toFixed(1));

function Card({
  href,
  icon,
  label,
  value,
  note,
}: {
  href: string;
  icon: string;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-1 rounded-3xl bg-canvas-ivory p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <span className="t-label-sm flex items-center justify-between text-text-muted">
        <span className="flex items-center gap-1.5">
          <Icon name={icon} size={16} className="text-primary" />
          {label}
        </span>
        <Icon
          name="arrow_forward"
          size={16}
          className="opacity-0 transition-opacity group-hover:opacity-100"
        />
      </span>
      <span className="t-headline-md text-on-surface">{value}</span>
      <span className="t-label-sm text-text-muted">{note}</span>
    </Link>
  );
}

function Panel({
  title,
  href,
  cta,
  children,
}: {
  title: string;
  href: string;
  cta: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-3xl bg-canvas-ivory p-6 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="t-headline-sm text-on-surface">{title}</h2>
        <Link
          href={href}
          className="t-label-md flex shrink-0 items-center gap-1 text-primary hover:underline"
        >
          {cta} <Icon name="arrow_forward" size={16} />
        </Link>
      </div>
      {children}
    </section>
  );
}

export async function DashboardOverview() {
  const { insight, pendingUsers, activeUsers, totalUsers, prompts } = await getDashboard();

  const published = [...prompts]
    .filter((p) => p.status === "terbit")
    .sort((a, b) => b.date.localeCompare(a.date));
  const latest = published[0];
  const latestStats = insight.promptStats.find((p) => p.id === latest?.id);
  const upcoming = prompts.filter((p) => p.status !== "terbit").sort(
    (a, b) => a.date.localeCompare(b.date),
  );

  const followUps = insight.people.filter((p) => p.flags.length > 0);

  return (
    <div className="mx-auto w-full max-w-[1720px] space-y-8 px-4 py-8 sm:px-8 lg:p-10">
      <PageHeader
        pill="Ringkasan"
        pulse={false}
        meta={`${activeUsers} peserta aktif`}
        title="Dashboard"
        description="Gambaran cepat pengguna, assessment, dan prompt jurnal. Klik kartu untuk membuka menu terkait."
      />

      <section
        aria-label="Ringkasan utama"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <Card
          href="/admin/users"
          icon="group"
          label="Users"
          value={String(totalUsers)}
          note={`${activeUsers} aktif · ${pendingUsers.length} menunggu aktivasi`}
        />
        <Card
          href="/admin/assessment/pre"
          icon="fact_check"
          label="Pre Assessment"
          value={`${insight.preDone}/${insight.total}`}
          note="peserta sudah mengisi"
        />
        <Card
          href="/admin/assessment/post"
          icon="task_alt"
          label="Post Assessment"
          value={`${insight.postDone}/${insight.total}`}
          note="peserta sudah mengisi"
        />
        <Card
          href="/admin/prompt"
          icon="menu_book"
          label="Respons Jurnal"
          value={insight.journalRate === null ? "-" : `${insight.journalRate}%`}
          note={
            insight.promptStats.length
              ? `rata-rata ${insight.promptStats.length} prompt terbit`
              : "belum ada prompt terbit"
          }
        />
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel title="Prompt Jurnal" href="/admin/prompt" cta="Kelola">
          {!latest && (
            <p className="t-body-sm rounded-2xl bg-canvas-cream p-4 text-text-muted">
              Belum ada prompt yang terbit. Statistik partisipasi muncul setelah
              prompt pertama tayang.
            </p>
          )}
          {latest && latestStats && (
            <div className="space-y-2 rounded-2xl bg-sage-tint/60 p-4">
              <p className="t-label-sm font-semibold text-primary">
                Terbit terakhir · {formatDateId(latest.date)}
              </p>
              <p className="t-title-md text-on-surface">{latest.title}</p>
              <div className="flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-container-high">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${(latestStats.done / latestStats.total) * 100}%`,
                    }}
                  />
                </div>
                <span className="t-label-md text-on-surface">
                  {latestStats.done}/{latestStats.total}
                </span>
              </div>
              <Link
                href={`/admin/prompt/${latest.id}/statistik`}
                className="t-label-md inline-flex items-center gap-1 text-primary hover:underline"
              >
                Lihat statistik <Icon name="arrow_forward" size={16} />
              </Link>
            </div>
          )}
          <div className="space-y-2">
            <p className="t-label-sm text-text-muted">Akan tayang</p>
            {upcoming.length === 0 ? (
              <p className="t-body-sm text-text-muted">
                Belum ada prompt terjadwal.
              </p>
            ) : (
              <ul className="space-y-2">
                {upcoming.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/admin/prompt/${p.id}`}
                      className="flex items-center justify-between gap-3 rounded-2xl bg-canvas-cream px-4 py-3 transition-colors hover:bg-surface-container-low"
                    >
                      <span className="t-title-sm text-on-surface">
                        {p.title}
                      </span>
                      <span className="t-label-sm shrink-0 text-text-muted">
                        {formatDateId(p.date)} ·{" "}
                        {p.status === "draf" ? "Draf" : "Terjadwal"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Panel>

        <Panel title="Perlu Tindak Lanjut" href="/admin/users" cta="Users">
          {pendingUsers.length === 0 && followUps.length === 0 ? (
            <p className="t-body-sm text-text-muted">
              Semua beres. Tidak ada yang perlu ditindaklanjuti.
            </p>
          ) : (
            <ul className="space-y-2">
              {pendingUsers.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-canvas-cream px-4 py-3"
                >
                  <span className="t-title-sm text-on-surface">{u.name}</span>
                  <span className="t-label-sm rounded-full bg-secondary-container px-2.5 py-0.5 whitespace-nowrap text-secondary">
                    Menunggu aktivasi
                  </span>
                </li>
              ))}
              {followUps.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-canvas-cream px-4 py-3"
                >
                  <span className="t-title-sm text-on-surface">{p.name}</span>
                  <span className="flex flex-wrap gap-1.5">
                    {p.flags.map((f) => (
                      <span
                        key={f}
                        className="t-label-sm rounded-full bg-secondary-container px-2.5 py-0.5 whitespace-nowrap text-secondary"
                      >
                        {f}
                      </span>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Insight Singkat"
          href="/admin/insight"
          cta="Lihat Insight"
        >
          <p className="t-body-sm text-text-muted">
            Rata-rata skor assessment (skala 1–5).
            {insight.postDone > 0
              ? ` Perubahan dari ${insight.pairedN} peserta yang mengisi Pre dan Post.`
              : " Perubahan Pre → Post tampil setelah ada yang mengisi Post."}
          </p>
          <ul className="space-y-3">
            {insight.partRows.map((p) => (
              <li
                key={p.part}
                className="space-y-1 rounded-2xl bg-canvas-cream p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="t-title-sm text-on-surface">
                    {ASSESSMENT_PARTS[p.part].title}
                  </span>
                  {insight.postDone > 0 && p.delta !== null && (
                    <span
                      className={`t-label-sm rounded-full px-2.5 py-0.5 font-semibold ${
                        p.delta >= 0
                          ? "bg-sage-tint text-primary"
                          : "bg-secondary-container text-secondary"
                      }`}
                    >
                      {p.delta >= 0 ? "+" : ""}
                      {p.delta.toFixed(1)}
                    </span>
                  )}
                </div>
                <p className="t-body-sm text-text-muted">
                  {insight.postDone > 0
                    ? `Pre ${fmt(p.pre)} → Post ${fmt(p.post)}`
                    : insight.preDone > 0
                      ? `Pre ${fmt(p.pre)} · Post belum tersedia`
                      : "Belum ada yang mengisi"}
                </p>
              </li>
            ))}
          </ul>
          {insight.topMood && (
            <p className="t-body-sm text-text-muted">
              Mood dominan di jurnal:{" "}
              <span className="font-semibold text-on-surface">
                {insight.topMood.emoji} {insight.topMood.label}
              </span>
            </p>
          )}
        </Panel>
      </div>
    </div>
  );
}
