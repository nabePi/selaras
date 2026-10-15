"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GIFT_KINDS, giftShareText, type GiftDto, type PersonalPrayer } from "@/data/gifts";
import { api } from "@/lib/api-client";
import { Icon } from "./icon";

export function GiftReader({ initial }: { initial: GiftDto | null }) {
  const [gift, setGift] = useState(initial);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!initial);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (initial) return;
    let active = true;
    void api<GiftDto>("/api/gift", "POST").then((result) => {
      if (!active) return;
      setLoading(false);
      if (result.ok) setGift(result.data);
      else setError(result.error);
    });
    return () => { active = false; };
  }, [initial, attempt]);

  if (loading) return (
    <div role="status" className="flex min-h-[55dvh] flex-col items-center justify-center gap-5 px-5 text-center">
      <span className="flex size-20 items-center justify-center rounded-full bg-sage-tint text-primary"><Icon name="redeem" size={36} /></span>
      <h2 className="t-headline-md text-on-surface">Sedang menyiapkan hadiahmu…</h2>
      <p className="t-body-md max-w-xs leading-relaxed text-text-muted">Ambil napas sebentar. Semoga ada kebaikan kecil yang bisa menemani harimu.</p>
    </div>
  );
  if (!gift) return (
    <div className="flex min-h-[50dvh] flex-col items-center justify-center gap-4 text-center">
      <Icon name="favorite" size={32} className="text-primary" />
      <h2 className="t-headline-md">Hadiahmu belum bisa dibuka</h2>
      <p role="alert" className="t-body-md text-text-muted">{error}</p>
      <button type="button" onClick={() => { setError(""); setLoading(true); setAttempt((n) => n + 1); }} className="t-title-sm rounded-full bg-primary px-6 py-3 text-on-primary">Coba lagi</button>
      <Link href="/home" className="t-body-md py-2 text-primary underline">Kembali ke Home</Link>
    </div>
  );
  return <GiftBody key={gift.id} gift={gift} />;
}

function PrayerText({ arabic, latin, meaning }: PersonalPrayer) {
  return (
    <div className="space-y-6">
      <p lang="ar" dir="rtl" className="gift-arabic text-right text-on-surface">{arabic}</p>
      <div className="space-y-2">
        <h3 className="t-label-sm font-semibold tracking-wider text-primary uppercase">Latin · panduan pelafalan</h3>
        <p className="t-body-lg leading-8 text-on-surface-variant italic">{latin}</p>
      </div>
      <div className="space-y-2">
        <h3 className="t-label-sm font-semibold tracking-wider text-primary uppercase">Artinya</h3>
        <p className="t-body-lg leading-8 text-on-surface">{meaning}</p>
      </div>
    </div>
  );
}

export function GiftBody({ gift }: { gift: GiftDto }) {
  const [vote, setVote] = useState(gift.feedback);
  const [voting, setVoting] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const meta = GIFT_KINDS[gift.content.kind];

  async function rate(next: "LIKE" | "DISLIKE") {
    if (voting) return;
    setVoting(true);
    const value = vote === next ? null : next;
    const result = await api<{ feedback: typeof vote }>(`/api/gift/${gift.id}/feedback`, "PATCH", { vote: value });
    setVoting(false);
    if (!result.ok) return setFeedbackMessage(result.error);
    setVote(result.data.feedback);
    setFeedbackMessage(value ? "Terima kasih sudah berbagi rasa. Masukanmu berarti untuk kami." : "Penilaianmu sudah dihapus.");
  }

  async function share() {
    if (sharing) return;
    setSharing(true);
    setShareMessage("");
    try {
      const text = giftShareText(gift);
      if (typeof navigator.share === "function") await navigator.share({ title: gift.content.title, text });
      else {
        await navigator.clipboard.writeText(text);
        setShareMessage("Isi hadiah dan referensinya sudah disalin. Kamu bisa menempelkannya untuk berbagi.");
      }
    } catch (e) {
      if (!(e instanceof Error && e.name === "AbortError")) setShareMessage("Belum bisa membagikan hadiah. Silakan coba lagi sebentar.");
    } finally { setSharing(false); }
  }

  return (
    <article className="flex flex-col pb-12">
      <header className="flex flex-col items-center gap-4 pt-7 pb-8 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-sage-tint text-primary"><Icon name={meta.icon} size={30} /></span>
        <span className="t-label-sm font-semibold tracking-[0.16em] text-primary uppercase">{meta.label}</span>
        <h2 className="t-headline-lg max-w-sm leading-snug text-on-surface">{gift.content.title}</h2>
        <span className="t-body-sm text-text-muted">Satu hadiah, untuk dinikmati perlahan.</span>
      </header>

      <section aria-label="Pesan untukmu" className="space-y-3 border-y border-border-subtle py-7">
        <h2 className="t-label-sm font-semibold tracking-wider text-primary uppercase">Untukmu, dengan hangat</h2>
        {gift.intro.split(/\n\s*\n/).map((p, i) => <p key={i} className="t-body-lg leading-8 text-on-surface-variant">{p}</p>)}
      </section>

      {gift.personalPrayer && (
        <section aria-label="Doa pribadi" className="space-y-5 py-8">
          <div className="space-y-2">
            <h2 className="t-headline-sm text-on-surface">Sebuah doa pribadi untukmu</h2>
            <p className="t-body-sm leading-relaxed text-text-muted">Dirangkai untuk menemani kondisimu; bukan kutipan Al-Qur’an atau hadis.</p>
          </div>
          <PrayerText {...gift.personalPrayer} />
        </section>
      )}

      <section aria-label="Isi hadiah" className="space-y-6 py-8">
        {gift.personalPrayer && <h2 className="t-headline-sm text-on-surface">Doa dari Al-Qur’an untuk menemani</h2>}
        {gift.content.arabic && gift.content.latin && gift.content.meaning && <PrayerText arabic={gift.content.arabic} latin={gift.content.latin} meaning={gift.content.meaning} />}
        {gift.content.paragraphs?.map((p, i) => <p key={i} className="t-body-lg leading-8 text-on-surface">{p}</p>)}
      </section>

      <aside aria-label="Referensi hadiah" className="space-y-2 rounded-2xl bg-surface-container-low p-4">
        <span className="t-label-sm flex items-center gap-1.5 font-semibold text-primary"><Icon name="library_books" size={16} /> Referensi bacaan</span>
        <a href={gift.content.source.url} target="_blank" rel="noopener noreferrer" className="t-body-md inline-flex items-center gap-1.5 text-on-surface underline decoration-outline-variant underline-offset-4">{gift.content.source.label}<Icon name="open_in_new" size={14} /></a>
        <p className="t-body-sm leading-relaxed text-text-muted">{gift.content.source.note}</p>
      </aside>

      <section aria-label="Penilaian hadiah" className="mt-9 flex flex-col items-center gap-3 border-t border-border-subtle pt-7 text-center">
        <h2 className="t-title-sm text-on-surface">Apakah hadiah ini terasa dekat denganmu?</h2>
        <p className="t-body-sm text-text-muted">Tidak ada jawaban yang salah. Kami ingin mendengarmu.</p>
        <div className="flex gap-3">
          {([{ value: "LIKE", icon: "thumb_up", label: "Suka hadiah ini" }, { value: "DISLIKE", icon: "thumb_down", label: "Kurang cocok" }] as const).map((option) => (
            <button key={option.value} type="button" aria-label={option.label} aria-pressed={vote === option.value} disabled={voting} onClick={() => void rate(option.value)} className={`flex size-12 items-center justify-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 ${vote === option.value ? "border-primary bg-primary text-on-primary" : "border-border-subtle bg-surface-bright text-primary hover:bg-sage-tint"}`}><Icon name={option.icon} size={21} filled={vote === option.value} /></button>
          ))}
        </div>
        {feedbackMessage && <p role="status" className="t-body-sm text-primary">{feedbackMessage}</p>}
      </section>

      <div className="mt-9 flex flex-col items-center gap-3">
        <button type="button" disabled={sharing} onClick={() => void share()} className="t-title-sm flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-on-primary transition-colors hover:bg-primary-container disabled:opacity-60"><Icon name="share" size={19} />{sharing ? "Membuka menu berbagi…" : "Bagikan kebaikan ini"}</button>
        <p className="t-body-sm text-center text-text-muted">Pengantar pribadimu tidak ikut dibagikan.</p>
        {shareMessage && <p role="status" className="t-body-sm text-center text-primary">{shareMessage}</p>}
        <p className="t-label-sm mt-3 text-text-muted">Hadiah berikutnya mulai {new Date(gift.expiresAt).toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta", day: "numeric", month: "long" })}</p>
      </div>
    </article>
  );
}
