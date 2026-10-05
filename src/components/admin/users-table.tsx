"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { activateUser, resetUserPassword } from "@/lib/admin-actions";
import { ADMIN_USERS, type AdminUser } from "@/data/admin-users";
import {
  PROFILE_AVATAR_KEY,
  PROFILE_NAME_KEY,
  PROFILE_SKILLS_KEY,
  parseSkills,
} from "@/lib/profile-storage";
import { useStoredValue } from "@/lib/stored-value";
import { formatDateId } from "@/data/admin-prompts";
import { Dialog, DialogActions } from "../dialog";
import { Icon } from "../icon";
import { useToast } from "../toast-provider";
import { PageHeader } from "./page-header";

const STATUS = {
  active: { label: "Aktif", tone: "bg-sage-tint text-primary" },
  pending: { label: "Menunggu", tone: "bg-secondary-container text-secondary" },
} as const;

export function UsersTable() {
  const storedName = useStoredValue(PROFILE_NAME_KEY);
  const storedAvatar = useStoredValue(PROFILE_AVATAR_KEY);
  const storedSkills = useStoredValue(PROFILE_SKILLS_KEY);
  const { showToast } = useToast();
  const [query, setQuery] = useState("");
  const [activated, setActivated] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);
  const [resetTarget, setResetTarget] = useState<AdminUser | null>(null);

  // Akun yang sedang login memakai data terbaru dari /profil.
  const users = useMemo<AdminUser[]>(
    () =>
      ADMIN_USERS.map((u) =>
        u.current
          ? {
              ...u,
              name: storedName ?? u.name,
              avatar: storedAvatar ?? u.avatar,
              skills: storedSkills ? parseSkills(storedSkills) : u.skills,
            }
          : u,
      ).map((u) => (activated.has(u.id) ? { ...u, status: "active" as const } : u)),
    [storedName, storedAvatar, storedSkills, activated],
  );

  async function activate(u: AdminUser) {
    setBusy(u.id);
    const result = await activateUser(u.id);
    setBusy(null);
    if (!result.ok) return showToast(result.error);
    setActivated((set) => new Set(set).add(u.id));
    showToast(`Akun ${u.name} berhasil diaktifkan.`, { tone: "success" });
  }

  async function confirmReset() {
    if (!resetTarget) return;
    setBusy(resetTarget.id);
    const result = await resetUserPassword(resetTarget.id);
    setBusy(null);
    if (!result.ok) return showToast(result.error);
    showToast(`Tautan reset password dikirim ke ${resetTarget.email}.`, { tone: "success" });
    setResetTarget(null);
  }

  const q = query.trim().toLowerCase();
  const rows = q
    ? users.filter((u) =>
        [u.name, u.email, u.whatsapp, u.id, ...u.skills].some((v) => v.toLowerCase().includes(q)),
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
              placeholder="Cari nama, email, keahlian..."
              className="t-body-sm w-72 max-w-full rounded-full bg-canvas-ivory py-2.5 pr-4 pl-9 text-on-surface shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-sage-medium"
            />
          </div>
        }
      />

      <div className="overflow-hidden rounded-3xl bg-canvas-ivory shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">Daftar pengguna</caption>
            <thead>
              <tr className="t-label-sm bg-surface-container-low tracking-wider text-text-muted uppercase">
                <th scope="col" className="py-4 pr-4 pl-6">Pengguna</th>
                <th scope="col" className="px-4 py-4">WhatsApp</th>
                <th scope="col" className="px-4 py-4">Email</th>
                <th scope="col" className="px-4 py-4">Potensi &amp; Keahlian</th>
                <th scope="col" className="px-4 py-4">Bergabung</th>
                <th scope="col" className="px-4 py-4">Status</th>
                <th scope="col" className="py-4 pr-6 pl-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="t-body-md divide-y divide-surface-container">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-text-muted">
                    Tidak ada pengguna yang cocok dengan “{query}”.
                  </td>
                </tr>
              )}
              {rows.map((u) => (
                <UserRow
                  key={u.id}
                  user={u}
                  busy={busy === u.id}
                  onActivate={() => activate(u)}
                  onReset={() => setResetTarget(u)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
            <span className="font-semibold text-on-surface">{resetTarget?.email}</span>. Password lama
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

function UserRow({
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
    <tr className="align-top">
      <td className="py-4 pr-4 pl-6">
        <div className="flex items-center gap-3">
          {u.avatar ? (
            <Image
              unoptimized={u.avatar.startsWith("data:")}
              src={u.avatar}
              alt=""
              width={40}
              height={40}
              className="size-10 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="t-label-md flex size-10 shrink-0 items-center justify-center rounded-full bg-sage-tint text-primary">
              {initials}
            </span>
          )}
          <div className="min-w-0">
            <p className="t-title-sm text-on-surface">{u.name}</p>
          </div>
        </div>
      </td>
      <td className="t-body-sm px-4 py-4 whitespace-nowrap text-on-surface">{u.whatsapp}</td>
      <td className="t-body-sm px-4 py-4 text-on-surface">{u.email}</td>
      <td className="px-4 py-4">
        {u.skills.length === 0 ? (
          <span className="t-body-sm text-text-muted">Belum diisi</span>
        ) : (
          <ul className="flex max-w-xs flex-wrap gap-1.5">
            {u.skills.map((s) => (
              <li key={s} className="t-label-sm rounded-full bg-sage-tint px-2.5 py-1 text-primary">
                {s}
              </li>
            ))}
          </ul>
        )}
      </td>
      <td className="t-body-sm px-4 py-4 whitespace-nowrap text-text-muted">{formatDateId(u.joined)}</td>
      <td className="px-4 py-4">
        <span className={`t-label-sm rounded-full px-3 py-1 font-semibold ${status.tone}`}>{status.label}</span>
      </td>
      <td className="py-4 pr-6 pl-4">
        <div className="flex items-center justify-end gap-2">
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
      </td>
    </tr>
  );
}
