import type { Metadata } from "next";
import { FocusHeader } from "@/components/focus-header";
import { Icon } from "@/components/icon";
import { ReflectionForm } from "@/components/reflection-form";
import { formatDateId } from "@/data/admin-prompts";
import { requireMemberPage } from "@/lib/server/session";
import { todayWib, weekdayId } from "@/lib/server/time";
import { getPromptForDate } from "@/server/admin/prompts";
import { getTodayEntry } from "@/server/member/journal";

export const metadata: Metadata = { title: "Tulis Jurnal" };

export default async function TulisJurnalPage() {
  const user = await requireMemberPage();
  const today = todayWib();
  // Prompt dipilih menurut tanggal hari ini (WIB); tanpa prompt, peserta menulis jurnal bebas.
  const prompt = await getPromptForDate(today);
  const entry = await getTodayEntry(user.id, prompt);

  return (
    <>
      <FocusHeader title="Tulis Jurnal" backHref="/home" hideLogo />
      <div className="flex w-full flex-col pb-10">
        <div className="mb-4 flex flex-col gap-2 pt-2">
          <div className="flex items-center justify-between">
            <span className="t-label-md font-semibold tracking-wide text-primary uppercase">
              {weekdayId(today)} · {formatDateId(today)}
            </span>
            {entry && (
              <span className="t-label-sm inline-flex items-center gap-1 rounded-full bg-sage-tint px-2.5 py-1 text-primary">
                <Icon name="check_circle" size={14} filled />
                Sudah ditulis
              </span>
            )}
          </div>
        </div>

        <section className="mb-4 flex flex-col gap-2">
          <span className="t-label-sm inline-flex items-center gap-1.5 self-start rounded-full bg-sage-tint px-3 py-1 text-primary">
            <Icon name="spa" size={15} filled />
            {prompt ? "Prompt Kurasi Coach" : "Jurnal Bebas"}
          </span>
          <h2 className="t-headline-md leading-snug text-on-surface">
            {prompt ? prompt.title : "Tulis apa pun yang kamu rasakan"}
          </h2>
          <p className="t-body-md text-text-muted">
            {prompt
              ? prompt.subtitle
              : "Belum ada prompt untuk hari ini. Ceritakan hari ini dengan kata-katamu sendiri."}
          </p>
        </section>

        <ReflectionForm
          key={`${today}-${entry ? "edit" : "baru"}`}
          questions={prompt?.questions}
          initial={entry}
        />
      </div>
    </>
  );
}
