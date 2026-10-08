import { adminRoute, ok, readJson } from "@/lib/server/route";
import { createPost, listAdminPosts, postSchema } from "@/server/blog";

export const GET = adminRoute(async () => ok(await listAdminPosts()));

export const POST = adminRoute(async ({ request, admin }) =>
  ok(await createPost(await readJson(request, postSchema), admin), { status: 201 }),
);
