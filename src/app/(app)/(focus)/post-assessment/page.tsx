import type { Metadata } from "next";
import { AssessmentWizard } from "@/components/assessment-wizard";
import { FocusHeader } from "@/components/focus-header";

export const metadata: Metadata = { title: "Post Assessment" };

export default function PostAssessmentPage() {
  return (
    <>
      <FocusHeader title="Post Assessment" backHref="/home" hideLogo />
      <div className="flex w-full flex-col gap-4 pb-10 pt-2">
        <p className="t-body-sm rounded-2xl bg-surface-container-low p-3 text-text-muted">
          Assessment ini adalah alat refleksi pribadimu, bukan penilaian keberhasilan
          program. Jawab sejujurnya sesuai kondisimu.
        </p>
        <AssessmentWizard kind="post" />
      </div>
    </>
  );
}
