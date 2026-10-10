import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UserJournalView } from "@/components/admin/user-journal-view";
import { requireAdminPage } from "@/lib/server/session";
import { listUserJournals } from "@/server/admin/users";

type Params = Promise<{ id: string }>;

export const metadata: Metadata = { title: "Jurnal Peserta" };

export default async function UserJournalPage({ params }: { params: Params }) {
  const { id } = await params;
  await requireAdminPage();
  const data = await listUserJournals(id);
  if (!data) notFound();
  return <UserJournalView user={data.user} entries={data.entries} privateCount={data.privateCount} />;
}
