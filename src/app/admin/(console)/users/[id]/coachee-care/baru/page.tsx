import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CoacheeCareForm } from "@/components/admin/coachee-care-form";
import { requireAdminPage } from "@/lib/server/session";
import { getMemberName } from "@/server/admin/coachee-care";

type Params = Promise<{ id: string }>;

export const metadata: Metadata = { title: "Beri Coachee Care" };

export default async function NewCoacheeCarePage({ params }: { params: Params }) {
  const { id } = await params;
  await requireAdminPage();
  const user = await getMemberName(id);
  if (!user) notFound();
  return <CoacheeCareForm user={user} />;
}
