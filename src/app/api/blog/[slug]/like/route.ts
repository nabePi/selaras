import { clientIp, rateLimit } from "@/lib/server/rate-limit";
import { ok, publicRoute } from "@/lib/server/route";
import { toggleLike } from "@/server/blog";
import { resolveActor } from "@/server/blog-actor";

export const POST = publicRoute<{ slug: string }>(async ({ request, params }) => {
  rateLimit(`like:${clientIp(request)}`, 30, 60_000);
  const actor = await resolveActor({ create: true });
  return ok(await toggleLike(params.slug, actor!));
});
