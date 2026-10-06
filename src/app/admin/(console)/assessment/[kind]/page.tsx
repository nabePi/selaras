import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AssessmentManager } from "@/components/admin/assessment-manager";
import { ASSESSMENT_KINDS } from "@/data/assessment";
import { requireAdminPage } from "@/lib/server/session";
import { getAssessmentResponses, isAssessmentVisible, listItems } from "@/server/admin/assessment";
import { isKind } from "@/server/admin/kind";

type Params = Promise<{ kind: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { kind } = await params;
  return { title: isKind(kind) ? ASSESSMENT_KINDS[kind].title : "Assessment" };
}

export default async function AssessmentAdminPage({ params }: { params: Params }) {
  const { kind } = await params;
  await requireAdminPage();
  if (!isKind(kind)) notFound();

  const [items, responses, visible] = await Promise.all([
    listItems(kind),
    getAssessmentResponses(kind),
    isAssessmentVisible(kind),
  ]);
  return <AssessmentManager key={kind} kind={kind} items={items} responses={responses} visible={visible} />;
}
