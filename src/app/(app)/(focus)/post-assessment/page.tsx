import type { Metadata } from "next";
import Link from "next/link";
import { AssessmentWizard } from "@/components/assessment-wizard";
import { FocusHeader } from "@/components/focus-header";
import { Icon } from "@/components/icon";
import { requireMemberPage } from "@/lib/server/session";
import { isAssessmentVisible, listItems } from "@/server/admin/assessment";
import { hasCompletedAssessment } from "@/server/member/assessment";

export const metadata: Metadata = { title: "Post Assessment" };

export default async function PostAssessmentPage() {
  const user = await requireMemberPage();
  const [items, completed, visible] = await Promise.all([
    listItems("post"),
    hasCompletedAssessment(user.id, "post"),
    isAssessmentVisible("post"),
  ]);
  const closed = !visible && !completed;

  return (
    <>
      <FocusHeader title="Post Assessment" backHref="/home" hideLogo />
      <div className="flex w-full flex-col gap-4 pb-10 pt-2">
        {completed || closed || items.length === 0 ? (
          <div className="flex w-full flex-col items-center gap-4 rounded-4xl bg-sage-tint p-6 text-center shadow-sm">
            <span className="flex size-14 items-center justify-center rounded-full bg-primary text-on-primary">
              <Icon name="check" size={28} />
            </span>
            <h2 className="t-headline-sm text-on-surface">
              {completed ? "Kamu sudah mengisi Post Assessment" : closed ? "Belum dibuka" : "Belum ada soal"}
            </h2>
            <p className="t-body-sm text-text-muted">
              {completed
                ? "Terima kasih. Jawabanmu sudah tersimpan dan tidak perlu diisi ulang."
                : closed
                  ? "Assessment ini belum dibuka. Tim pendamping akan membukanya pada waktunya."
                  : "Soal assessment ini sedang disiapkan oleh tim pendamping."}
            </p>
            <Link
              href="/home"
              className="t-title-sm flex w-full items-center justify-center rounded-full bg-primary px-6 py-3.5 text-on-primary shadow-md transition-all active:scale-[0.99]"
            >
              Kembali ke Beranda
            </Link>
          </div>
        ) : (
          <>
            <p className="t-body-sm rounded-2xl bg-surface-container-low p-3 text-text-muted">
              Assessment ini adalah alat refleksi pribadimu, bukan penilaian keberhasilan
              program. Jawab sejujurnya sesuai kondisimu.
            </p>
            <AssessmentWizard kind="post" items={items} />
          </>
        )}
      </div>
    </>
  );
}
