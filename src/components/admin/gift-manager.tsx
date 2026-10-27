"use client";

import { useState } from "react";
import { GIFT_CONTENT, GIFT_KINDS } from "@/data/gifts";
import { api } from "@/lib/api-client";
import { Icon } from "../icon";
import { useToast } from "../toast-provider";
import { PageHeader } from "./page-header";

type Overview = { enabled: boolean; total: number; likes: number; dislikes: number; themeFallbacks: number; neutralFallbacks: number; ai: { provider: string; model: string; configured: boolean } };

export function GiftManager({ initial }: { initial: Overview }) {
  const [enabled, setEnabled] = useState(initial.enabled);
  const [busy, setBusy] = useState(false);
  const { showToast } = useToast();

  async function toggle() {
    if (busy) return;
    setBusy(true);
    const result = await api<{ enabled: boolean }>("/api/admin/gift", "PATCH", { enabled: !enabled });
    setBusy(false);
    if (!result.ok) return showToast(result.error);
    setEnabled(result.data.enabled);
    showToast(result.data.enabled ? "Gift sekarang aktif untuk semua peserta." : "Gift sudah dinonaktifkan.", { tone: "success" });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-8 lg:p-10">
      <PageHeader pill="Gift" pulse={false} title="Hadiah kecil, untuk perjalanan mereka." description="Temani peserta dengan doa, kisah, ayat Al-Qur’an, atau hadis yang dipilih sesuai profil dan jurnalnya. Satu hadiah baru setiap tiga hari." />

      <section className="flex items-center justify-between gap-5 rounded-3xl bg-sage-tint p-5 sm:p-7">
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-surface-bright text-primary"><Icon name="redeem" size={26} /></span>
          <div className="space-y-1.5">
            <h2 id="gift-switch-label" className="t-title-lg text-on-surface">Aktifkan Gift untuk semua peserta</h2>
            <p className="t-body-md text-on-surface-variant">{enabled ? "Aktif · kartu Gift tampil di Home. Hadiah disiapkan saat peserta membukanya." : "Nonaktif · kartu disembunyikan dan pembuatan hadiah berhenti."}</p>
          </div>
        </div>
        <button type="button" role="switch" aria-checked={enabled} aria-labelledby="gift-switch-label" disabled={busy} onClick={() => void toggle()} className={`relative h-8 w-14 shrink-0 rounded-full p-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:opacity-50 ${enabled ? "bg-primary" : "bg-canvas-sand"}`}><span className={`block size-6 rounded-full bg-white shadow-sm transition-transform ${enabled ? "translate-x-6" : "translate-x-0"}`} /></button>
      </section>

      <dl className="grid grid-cols-3 gap-3 sm:gap-5">
        {[{ label: "Hadiah tersampaikan", value: initial.total, icon: "redeem" }, { label: "Disukai", value: initial.likes, icon: "thumb_up" }, { label: "Kurang cocok", value: initial.dislikes, icon: "thumb_down" }].map((stat) => (
          <div key={stat.label} className="space-y-3 rounded-2xl bg-canvas-ivory p-4 sm:p-6"><Icon name={stat.icon} size={20} className="text-primary" /><dt className="t-body-sm text-text-muted">{stat.label}</dt><dd className="t-headline-lg text-on-surface">{stat.value}</dd></div>
        ))}
      </dl>

      <section className="space-y-4 border-t border-border-subtle pt-6">
        <h2 className="t-title-lg">Personalisasi dan siklus hadiah</h2>
        <p className="t-body-md leading-7 text-on-surface-variant">{initial.ai.configured ? `Terhubung ke ${initial.ai.provider === "openai" ? "OpenAI" : "DeepSeek"} · ${initial.ai.model}.` : "API key belum dikonfigurasi. Bacaan, pengantar, dan refleksi tetap dipilih berdasarkan tema dari jurnal yang tersedia."}</p>
        <p className="t-body-sm leading-6 text-text-muted">{initial.themeFallbacks} hadiah memakai pencocokan tema saat AI tidak tersedia. {initial.neutralFallbacks} hadiah memakai pengantar netral, termasuk hadiah dari versi lama. Tanpa jurnal, aplikasi tidak mengarang kondisi peserta.</p>
        <ul className="t-body-md list-disc space-y-2 pl-5 leading-7 text-text-muted">
          <li>AI membaca maksimal lima jurnal terakhir dan bahan sumber lengkap untuk merangkai judul, pengantar, isi hadiah, penutup, refleksi, dan satu ajakan ringan. Profil hanya pelengkap. Kutipan ayat dan hadis tetap diambil dari koleksi; penceritaan ulang kisah harus mengikuti bahan sumber.</li>
          <li>Doa pribadi boleh dirangkai, dengan label yang membedakannya dari kutipan Al-Qur’an dan hadis.</li>
          <li>Siklus tiga hari dihitung berdasarkan tanggal WIB sejak fitur diaktifkan. Menonaktifkan lalu mengaktifkan kembali memulai siklus baru.</li>
          <li>Halaman ini hanya menampilkan jumlah penilaian, tanpa membuka jurnal privat atau pengantar pribadi peserta.</li>
        </ul>
      </section>

      <section className="space-y-4 border-t border-border-subtle pt-6">
        <h2 className="t-title-lg">Koleksi dan sumber bacaan</h2>
        <div className="divide-y divide-border-subtle">
          {GIFT_CONTENT.map((c) => <div key={c.id} className="flex items-start gap-3 py-4"><Icon name={GIFT_KINDS[c.kind].icon} size={20} className="mt-0.5 shrink-0 text-primary" /><div className="min-w-0 space-y-1"><p className="t-title-sm text-on-surface">{c.title}</p><a href={c.source.url} target="_blank" rel="noopener noreferrer" className="t-body-sm text-primary underline underline-offset-4">{c.source.label}</a></div></div>)}
        </div>
      </section>
    </div>
  );
}
