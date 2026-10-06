import type { Metadata } from "next";
import { UsersTable } from "@/components/admin/users-table";
import { requireAdminPage } from "@/lib/server/session";
import { listUsers } from "@/server/admin/users";

export const metadata: Metadata = { title: "Users" };

export default async function UsersPage() {
  await requireAdminPage();
  return <UsersTable users={await listUsers()} />;
}
