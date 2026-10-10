"use client";

import { useState } from "react";
import { CARE_REACTIONS, type CoacheeCare } from "@/data/coachee-care";
import { buildWhatsappLink } from "@/data/programs";
import { api } from "@/lib/api-client";
import { Icon } from "./icon";
import { useToast } from "./toast-provider";

/** Reaksi emoji peserta (tanda sudah membaca) dan ajakan ngobrol langsung dengan coach lewat WhatsApp. */
export function CareReaction({ care }: { care: Pick<CoacheeCare, "id" | "title" | "authorName" | "reaction"> }) {
  const { showToast } = useToast();
  const [emoji, setEmoji] = useState<string | null>(care.reaction?.emoji ?? null);
  const [busy, setBusy] = useState(false);

  async function react(next: string) {
    if (busy || next === emoji) return;
    setBusy(true);
    const result = await api(`/api/coachee-care/${care.id}/reaction`, "POST", { emoji: next });
    setBusy(false);
    if (!result.ok) return showToast(result.error);
    setEmoji(next);
    showToast("Terima kasih, reaksimu sudah dikirim ke coach.", { tone: "success" });
  }

  return (
    <div className="flex flex-col gap-4 print:hidden">
      <section aria-label="Reaksi" className="flex flex-col gap-2 rounded-2xl bg-surface-container-low p-4">
        <p className="t-title-sm text-on-surface">{emoji ? "Reaksimu terkirim 🌿" : "Bagaimana perasaanmu setelah membaca ini?"}</p>
        <p className="t-body-sm text-text-muted">
          {emoji ? "Coach tahu kamu sudah membaca. Kamu bisa mengganti reaksi kapan saja." : "Pilih satu reaksi agar coach tahu kamu sudah membaca."}
        </p>
        <div role="group" aria-label="Pilih reaksi" className="flex flex-wrap gap-2 pt-1">
          {CARE_REACTIONS.map((e) => (
            <button
              key={e}
              type="button"
              disabled={busy}
              aria-pressed={e === emoji}
              aria-label={`Reaksi ${e}`}
              onClick={() => void react(e)}
              className={`flex size-12 items-center justify-center rounded-full text-2xl transition-all disabled:opacity-60 ${
                e === emoji ? "bg-sage-tint ring-2 ring-primary" : "bg-surface-container-lowest shadow-sm hover:scale-105"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </section>

      <a
        href={buildWhatsappLink(`Halo Selaras, saya ingin ngobrol lebih dalam dengan coach soal coachee care "${care.title}" dari ${care.authorName}.`)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-2xl bg-primary p-4 text-on-primary shadow-md transition-all hover:bg-primary-container active:scale-[0.99]"
      >
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-on-primary/15">
          <Icon name="forum" size={22} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="t-title-sm">Need a deep talk with Coach?</span>
          <span className="t-body-sm opacity-90">Ngobrol langsung lewat WhatsApp Selaras</span>
        </span>
        <Icon name="arrow_forward" size={20} className="shrink-0" />
      </a>
    </div>
  );
}
