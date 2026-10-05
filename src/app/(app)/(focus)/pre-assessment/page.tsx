import type { Metadata } from "next";
import { FocusHeader } from "@/components/focus-header";
import { PreAssessmentWizard } from "@/components/pre-assessment-wizard";

export const metadata: Metadata = { title: "Pre Assessment" };

export default function PreAssessmentPage() {
  return (
    <>
      <FocusHeader title="Pre Assessment" backHref="/home" hideLogo />
      <div className="flex w-full flex-col gap-4 pb-10 pt-2">
        <p className="t-body-sm rounded-2xl bg-surface-container-low p-3 text-text-muted">
          Assessment ini adalah alat refleksi pribadimu, bukan penilaian keberhasilan
          program. Jawab sejujurnya sesuai kondisimu.
        </p>
        <PreAssessmentWizard />
      </div>
    </>
  );
}
