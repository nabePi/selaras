import { notFound } from "@/lib/server/errors";
import { adminRoute, ok, readJson } from "@/lib/server/route";
import { deletePost, getAdminPost, postSchema, updatePost } from "@/server/blog";

type P = { id: string };

export const GET = adminRoute<P>(async ({ params }) => {
  const post = await getAdminPost(params.id);
  if (!post) throw notFound("Artikel");
  return ok(post);
});

export const PATCH = adminRoute<P>(async ({ request, params, admin }) =>
  ok(await updatePost(params.id, await readJson(request, postSchema), admin)),
);

export const DELETE = adminRoute<P>(async ({ params }) => ok(await deletePost(params.id)));
