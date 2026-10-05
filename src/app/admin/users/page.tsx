import type { Metadata } from "next";
import { UsersTable } from "@/components/admin/users-table";

export const metadata: Metadata = { title: "Users" };

export default function UsersPage() {
  return <UsersTable />;
}
