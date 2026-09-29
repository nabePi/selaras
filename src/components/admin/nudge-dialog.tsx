"use client";

import { useState } from "react";
import { sendNudge } from "@/lib/admin-actions";
import { Dialog, DialogActions, FieldLabel, fieldClass } from "../dialog";
import { Icon } from "../icon";
import { useToast } from "../toast-provider";

export const NUDGE_AUDIENCES = [
  { value: "backlog", label: "Pasutri dengan backlog gating", count: 3 },
  { value: "unfilled", label: "Belum mengisi refleksi hari ini", count: 14 },
  { value: "active", label: "Semua peserta aktif Cohort 04", count: 45 },
] as const;

export type NudgeAudience = (typeof NUDGE_AUDIENCES)[number]["value"];

const TEMPLATE =
  "Assalamu’alaikum, sekadar menyapa dengan lembut. Bagaimana kabar hati kalian hari ini? Jika sempat, luangkan 3 menit untuk refleksi hari ini. Kami mendampingi kalian 🤍";

export function NudgeDialog({
  open,
  onClose,
  initialAudience = "backlog",
}: {
  open: boolean;
  onClose: () => void;
  initialAudience?: NudgeAudience;
}) {
  return (
    <Dialog open={open} onClose={onClose} eyebrow="Pendampingan" title="Kirim Nudge Afeksi">
      <NudgeForm onClose={onClose} initialAudience={initialAudience} />
    </Dialog>
  );
}

function NudgeForm({ onClose, initialAudience }: { onClose: () => void; initialAudience: NudgeAudience }) {
  const { showToast } = useToast();
  const [audience, setAudience] = useState<NudgeAudience>(initialAudience);
  const [message, setMessage] = useState(TEMPLATE);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const target = NUDGE_AUDIENCES.find((a) => a.value === audience)!;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) {
      setError("Tulis pesan sapaan terlebih dahulu.");
      return;
    }
    setSending(true);
    const result = await sendNudge({ kind: "audience", audience: target.label, count: target.count }, message);
    setSending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onClose();
    showToast(`Nudge afeksi dikirim ke ${target.count} pasangan (${target.label.toLowerCase()}).`, { tone: "success", duration: 3500 });
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="space-y-1">
        <FieldLabel htmlFor="nudge-audience">Penerima</FieldLabel>
        <select
          id="nudge-audience"
          value={audience}
          onChange={(e) => setAudience(e.target.value as NudgeAudience)}
          className={`${fieldClass} cursor-pointer`}
        >
          {NUDGE_AUDIENCES.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label} ({a.count} pasang)
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <FieldLabel htmlFor="nudge-message" hint={<span>{message.length}/300</span>}>
          Pesan WhatsApp
        </FieldLabel>
        <textarea
          id="nudge-message"
          rows={5}
          maxLength={300}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            setError("");
          }}
          className={`${fieldClass} resize-none leading-relaxed`}
        />
        {error && (
          <p role="alert" className="t-body-sm text-error">
            {error}
          </p>
        )}
      </div>

      <div className="flex items-start gap-2.5 rounded-2xl bg-sage-tint p-3.5">
        <Icon name="info" size={18} className="mt-0.5 shrink-0 text-primary" />
        <p className="t-body-sm leading-snug text-primary">
          Gunakan sapaan yang hangat dan tidak menghakimi. Pesan dikirim lewat mesin otomatis Selaras
          dengan nama coach sebagai pengirim.
        </p>
      </div>

      <DialogActions onCancel={onClose} submitLabel="Kirim Nudge" submitting={sending} />
    </form>
  );
}
