import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icon";
import { requireAdminPage } from "@/lib/server/session";
import { listUserActivity } from "@/server/admin/users";

type Params = Promise<{ id: string }>;

export const metadata: Metadata = { title: "Aktivitas Peserta" };

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-3xl bg-canvas-ivory p-5 shadow-sm">
      <span className="t-label-sm text-text-muted">{label}</span>
      <span className="t-title-md text-on-surface">{value}</span>
      {note && <span className="t-label-sm text-text-muted">{note}</span>}
    </div>
  );
}

export default async function UserActivityPage({ params }: { params: Params }) {
  const { id } = await params;
  await requireAdminPage();
  const data = await listUserActivity(id);
  if (!data) notFound();

  return (
    <div className="mx-auto w-full max-w-[1720px] space-y-8 px-4 py-8 sm:px-8 lg:p-10">
      <header className="space-y-2 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="t-label-sm inline-flex items-center gap-1.5 rounded-full bg-sage-tint px-3 py-1 tracking-wide text-primary">
              <span className="size-1.5 rounded-full bg-primary" />
              Aktivitas Peserta
            </span>
            <span className="t-body-sm text-text-muted" aria-hidden="true">
              •
            </span>
            <span className="t-body-sm text-text-muted">{data.user.id}</span>
          </div>
          <Link
            href="/admin/users"
            className="t-title-sm flex items-center gap-2 rounded-full bg-canvas-cream px-4 py-2.5 text-on-surface shadow-sm transition-colors hover:bg-surface-container-low"
          >
            <Icon name="arrow_back" size={18} />
            Kembali ke Users
          </Link>
        </div>
        <h1 className="t-headline-lg tracking-tight text-on-surface">{data.user.name}</h1>
        <p className="t-body-md max-w-3xl leading-relaxed text-text-muted">
          Kapan saja peserta membuka Selaras Life (waktu WIB). Satu kunjungan dihitung baru bila sudah 30 menit sejak aktivitas
          sebelumnya.
        </p>
      </header>

      <section aria-label="Ringkasan" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Terakhir akses" value={data.lastSeen?.ago ?? "Belum pernah"} note={data.lastSeen?.label} />
        <Stat label="Total kunjungan" value={String(data.total)} />
        <Stat label="Hari aktif" value={String(data.activeDays)} note={data.shown < data.total ? `dari ${data.shown} kunjungan terbaru` : undefined} />
        <Stat label="Kunjungan pertama tercatat" value={data.firstVisit ?? "-"} />
      </section>

      {data.days.length === 0 ? (
        <p className="t-body-md rounded-3xl bg-canvas-ivory px-6 py-12 text-center text-text-muted shadow-sm">
          Belum ada kunjungan yang tercatat untuk peserta ini.
        </p>
      ) : (
        <ol className="space-y-3">
          {data.days.map((d) => (
            <li key={d.date} className="flex flex-col gap-3 rounded-3xl bg-canvas-ivory p-5 shadow-sm sm:flex-row sm:items-start sm:gap-6">
              <div className="sm:w-56 sm:shrink-0">
                <p className="t-title-sm text-on-surface">{d.label}</p>
                <p className="t-label-sm text-text-muted">{d.times.length} kunjungan</p>
              </div>
              <ul className="flex flex-wrap gap-1.5">
                {d.times.map((t, i) => (
                  <li key={`${t}-${i}`} className="t-label-md flex items-center gap-1 rounded-full bg-sage-tint px-3 py-1 text-primary">
                    <Icon name="schedule" size={14} />
                    {t}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
