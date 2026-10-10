import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CoacheeCareView } from "@/components/admin/coachee-care-view";
import { requireAdminPage } from "@/lib/server/session";
import { listCoacheeCare } from "@/server/admin/coachee-care";

type Params = Promise<{ id: string }>;

export const metadata: Metadata = { title: "Coachee Care" };

export default async function CoacheeCarePage({ params }: { params: Params }) {
  const { id } = await params;
  await requireAdminPage();
  const data = await listCoacheeCare(id);
  if (!data) notFound();
  return <CoacheeCareView user={data.user} items={data.items} />;
}
