import "server-only";
import { db } from "@/lib/db";

export type NotificationDto = {
  id: string;
  kind: "REFLEKSI" | "PESAN" | "HADIS" | "SISTEM";
  title: string;
  body: string;
  detail: string;
  href: string | null;
  actionLabel: string | null;
  read: boolean;
  createdAt: Date;
};

type Row = Awaited<ReturnType<typeof db.notification.findFirstOrThrow>>;

const toDto = (r: Row): NotificationDto => ({
  id: String(r.id),
  kind: r.kind,
  title: r.title,
  body: r.body,
  detail: r.detail,
  href: r.href,
  actionLabel: r.actionLabel,
  read: r.readAt !== null,
  createdAt: r.createdAt,
});

export async function listNotifications(userId: number): Promise<NotificationDto[]> {
  const rows = await db.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 100 });
  return rows.map(toDto);
}

export function countUnread(userId: number): Promise<number> {
  return db.notification.count({ where: { userId, readAt: null } });
}

/** Membuka satu notifikasi milik peserta dan menandainya sudah dibaca. */
export async function openNotification(userId: number, id: string): Promise<NotificationDto | null> {
  const n = Number(id);
  if (!Number.isSafeInteger(n) || n <= 0) return null;
  const row = await db.notification.findFirst({ where: { id: n, userId } });
  if (!row) return null;
  if (row.readAt) return toDto(row);
  const updated = await db.notification.update({ where: { id: row.id }, data: { readAt: new Date() } });
  return toDto(updated);
}
