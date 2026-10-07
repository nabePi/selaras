import { adminRoute, ok, readJson } from "@/lib/server/route";
import { createUserSchema } from "@/server/admin/schemas";
import { createUser, listUsers } from "@/server/admin/users";

export const GET = adminRoute(async () => ok(await listUsers()));

export const POST = adminRoute(async ({ request }) => ok(await createUser(await readJson(request, createUserSchema)), { status: 201 }));
