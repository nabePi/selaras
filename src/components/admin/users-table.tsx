"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { activateUser, resetUserPassword } from "@/lib/admin-actions";
import type { AdminUser } from "@/data/admin-users";
import { formatDateId } from "@/data/admin-prompts";
import { Dialog, DialogActions } from "../dialog";
import { Icon } from "../icon";
import { useToast } from "../toast-provider";
import { AddUserDialog } from "./add-user-dialog";
import { btnPrimary, PageHeader } from "./page-header";

const STATUS = {
  active: { label: "Aktif", tone: "bg-sage-tint text-primary" },
  pending: { label: "Menunggu", tone: "bg-secondary-container text-secondary" },
} as const;

export function UsersTable({ users }: { users: AdminUser[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [resetTarget, setResetTarget] = useState<AdminUser | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  async function activate(u: AdminUser) {
    setBusy(u.id);
    const result = await activateUser(u.id);
    setBusy(null);
    if (!result.ok) return showToast(result.error);
    router.refresh();
    showToast(`Akun ${u.name} berhasil diaktifkan.`, { tone: "success" });
  }

  async function confirmReset() {
    if (!resetTarget) return;
    setBusy(resetTarget.id);
    const result = await resetUserPassword(resetTarget.id);
    setBusy(null);
    if (!result.ok) return showToast(result.error);
    showToast(`Tautan reset password dikirim ke ${resetTarget.email ?? resetTarget.name}.`, { tone: "success" });
    setResetTarget(null);
  }

  const q = query.trim().toLowerCase();
  const rows = q
    ? users.filter((u) =>
        [u.name, u.email ?? "", u.whatsapp, u.id, u.activities ?? "", u.maritalStatus ?? "", ...u.skills].some((v) => v.toLowerCase().includes(q)),
      )
    : users;

  return (
    <div className="mx-auto w-full max-w-[1720px] space-y-8 px-4 py-8 sm:px-8 lg:p-10">
      <PageHeader
        pill="Data Pengguna"
        pulse={false}
        meta={`${users.length} pengguna terdaftar`}
        title="Users"
        description="Data akun pengguna beserta profil dan potensi/keahlian yang mereka isi di halaman profil."
        actions={
          <>
            <div className="relative">
              <Icon
                name="search"
                size={18}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-muted"
              />
              <label htmlFor="users-search" className="sr-only">
                Cari pengguna
              </label>
              <input
                id="users-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari nama, email, keahlian, kegiatan..."
                className="t-body-sm w-72 max-w-full rounded-full bg-canvas-ivory py-2.5 pr-4 pl-9 text-on-surface shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-sage-medium"
              />
            </div>
            <button type="button" onClick={() => setAddOpen(true)} className={btnPrimary}>
              <Icon name="person_add" size={18} />
              Tambah User
            </button>
          </>
        }
      />

      {rows.length === 0 ? (
        <p className="t-body-md rounded-3xl bg-canvas-ivory px-6 py-12 text-center text-text-muted shadow-sm">
          Tidak ada pengguna yang cocok dengan “{query}”.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {rows.map((u) => (
            <UserCard key={u.id} user={u} busy={busy === u.id} onActivate={() => activate(u)} onReset={() => setResetTarget(u)} />
          ))}
        </ul>
      )}

      <AddUserDialog open={addOpen} onClose={() => setAddOpen(false)} onCreated={() => router.refresh()} />

      <Dialog
        open={resetTarget !== null}
        onClose={() => setResetTarget(null)}
        eyebrow="Keamanan Akun"
        title="Reset Password"
        size="sm"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void confirmReset();
          }}
          className="space-y-4"
        >
          <p className="t-body-md text-text-muted">
            Tautan untuk membuat password baru akan dikirim ke{" "}
            <span className="font-semibold text-on-surface">{resetTarget?.email ?? "(belum ada email)"}</span>. Password lama
            tidak berlaku lagi setelah {resetTarget?.name} membuat yang baru.
          </p>
          <DialogActions
            onCancel={() => setResetTarget(null)}
            submitLabel="Kirim Tautan Reset"
            submitting={busy !== null && busy === resetTarget?.id}
          />
        </form>
      </Dialog>
    </div>
  );
}

function Empty() {
  return <span className="text-text-muted">Belum diisi</span>;
}

function UserCard({
  user: u,
  busy,
  onActivate,
  onReset,
}: {
  user: AdminUser;
  busy: boolean;
  onActivate: () => void;
  onReset: () => void;
}) {
  const status = STATUS[u.status];
  const initials = u.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <li className="flex flex-col overflow-hidden rounded-3xl bg-canvas-ivory shadow-sm transition-shadow hover:shadow-md">
      <div className="h-1.5 bg-gradient-to-r from-sage-medium to-primary" aria-hidden />
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start gap-3">
          {u.avatar ? (
            <Image
              unoptimized={!u.avatar.startsWith("/")}
              src={u.avatar}
              alt=""
              width={56}
              height={56}
              className="size-14 shrink-0 rounded-full object-cover ring-2 ring-sage-tint"
            />
          ) : (
            <span className="t-title-sm flex size-14 shrink-0 items-center justify-center rounded-full bg-sage-tint text-primary ring-2 ring-canvas-cream">
              {initials}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="t-title-md truncate text-on-surface" title={u.name}>
              {u.name}
            </p>
            <p className="t-label-sm text-text-muted">
              {u.id} · Bergabung {formatDateId(u.joined)}
            </p>
          </div>
          <span className={`t-label-sm shrink-0 rounded-full px-3 py-1 font-semibold ${status.tone}`}>{status.label}</span>
        </div>

        <dl className="t-body-sm space-y-2 rounded-2xl bg-canvas-cream p-3.5">
          <div className="flex items-center gap-2.5">
            <Icon name="call" size={16} className="shrink-0 text-primary" />
            <dt className="sr-only">WhatsApp</dt>
            <dd className="text-on-surface">{u.whatsapp}</dd>
          </div>
          <div className="flex items-center gap-2.5">
            <Icon name="mail" size={16} className="shrink-0 text-primary" />
            <dt className="sr-only">Email</dt>
            <dd className="min-w-0 truncate text-on-surface" title={u.email ?? undefined}>
              {u.email ?? <span className="text-text-muted">—</span>}
            </dd>
          </div>
          <div className="flex items-center gap-2.5">
            <Icon name="favorite" size={16} className="shrink-0 text-primary" />
            <dt className="sr-only">Status pernikahan</dt>
            <dd className="text-on-surface">{u.maritalStatus ?? <Empty />}</dd>
          </div>
          {u.lastCare && (
            <div className="flex items-start gap-2.5">
              <Icon name="volunteer_activism" size={16} className="mt-0.5 shrink-0 text-primary" />
              <dt className="sr-only">Coachee care terakhir</dt>
              <dd className="text-on-surface">
                Coachee care terakhir dari <span className="font-semibold">{u.lastCare.coach}</span>
                <span className="text-text-muted"> · {formatDateId(u.lastCare.date)}</span>
              </dd>
            </div>
          )}
        </dl>

        <div className="space-y-1.5">
          <p className="t-label-sm tracking-wider text-text-muted uppercase">Potensi &amp; Keahlian</p>
          {u.skills.length === 0 ? (
            <p className="t-body-sm">
              <Empty />
            </p>
          ) : (
            <ul className="flex flex-wrap gap-1.5">
              {u.skills.map((s) => (
                <li key={s} className="t-label-sm rounded-full bg-sage-tint px-2.5 py-1 text-primary">
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-1.5">
          <p className="t-label-sm tracking-wider text-text-muted uppercase">Kegiatan Sehari-hari</p>
          {u.activities ? (
            <p className="t-body-sm break-words whitespace-pre-line text-on-surface">
              {u.activities}
            </p>
          ) : (
            <p className="t-body-sm">
              <Empty />
            </p>
          )}
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-surface-container pt-4">
          {u.status === "pending" && (
            <button
              type="button"
              disabled={busy}
              onClick={onActivate}
              className="t-label-md flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 whitespace-nowrap text-on-primary shadow-sm transition-colors hover:bg-primary-container disabled:opacity-60"
            >
              <Icon name="how_to_reg" size={16} />
              {busy ? "Memproses..." : "Aktivasi"}
            </button>
          )}
          <Link
            href={`/admin/users/${u.id}/jurnal`}
            className="t-label-md flex items-center gap-1.5 rounded-full bg-sage-tint px-4 py-2 whitespace-nowrap text-primary transition-colors hover:bg-sage-medium/40"
          >
            <Icon name="menu_book" size={16} />
            Jurnal
          </Link>
          <button
            type="button"
            disabled={busy}
            onClick={onReset}
            className="t-label-md flex items-center gap-1.5 rounded-full bg-surface-container-low px-4 py-2 whitespace-nowrap text-on-surface transition-colors hover:bg-surface-container disabled:opacity-60"
          >
            <Icon name="lock_reset" size={16} />
            Reset Password
          </button>
        </div>
      </div>
    </li>
  );
}
