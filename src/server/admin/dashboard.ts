import "server-only";
import { cache } from "react";
import { getInsight } from "./insight";
import { listPrompts } from "./prompts";
import { listUsers } from "./users";

/** Data ringkasan untuk halaman Dashboard admin. */
export const getDashboard = cache(async () => {
  const [users, prompts, insight] = await Promise.all([listUsers(), listPrompts(), getInsight()]);
  const pendingUsers = users.filter((u) => u.status === "pending");
  return {
    totalUsers: users.length,
    activeUsers: users.length - pendingUsers.length,
    pendingUsers,
    prompts,
    insight,
  };
});
