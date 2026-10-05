import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AssessmentManager } from "@/components/admin/assessment-manager";
import { ASSESSMENT_KINDS, type AssessmentKind } from "@/data/assessment";
import { getAssessmentResponses } from "@/data/assessment-responses";

type Params = Promise<{ kind: string }>;

const isKind = (v: string): v is AssessmentKind => v in ASSESSMENT_KINDS;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { kind } = await params;
  return { title: isKind(kind) ? ASSESSMENT_KINDS[kind].title : "Assessment" };
}

export default async function AssessmentAdminPage({ params }: { params: Params }) {
  const { kind } = await params;
  if (!isKind(kind)) notFound();

  return <AssessmentManager key={kind} kind={kind} responses={getAssessmentResponses(kind)} />;
}
