import type { NotificationDto } from "@/server/member/notifications";

/** Ikon dan warna per jenis notifikasi. */
export const NOTIFICATION_STYLE: Record<NotificationDto["kind"], { icon: string; tone: string; label: string }> = {
  REFLEKSI: { icon: "edit_note", tone: "bg-secondary-container text-secondary", label: "Pengingat Refleksi" },
  PESAN: { icon: "support_agent", tone: "bg-accent-mint/40 text-primary", label: "Pesan dari Tim" },
  HADIS: { icon: "auto_stories", tone: "bg-sage-tint text-primary", label: "Hadis Harian" },
  SISTEM: { icon: "info", tone: "bg-surface-container-high text-on-surface-variant", label: "Info" },
};
