import { z } from "zod";
import { memberRoute, ok, readJson } from "@/lib/server/route";
import { giftFeedback } from "@/server/member/gift";

export const PATCH = memberRoute<{ id: string }>(async ({ user, params, request }) => {
  const id = z.string().uuid().parse(params.id);
  const { vote } = await readJson(request, z.object({ vote: z.enum(["LIKE", "DISLIKE"]).nullable() }));
  return ok(await giftFeedback(user.id, id, vote), { headers: { "Cache-Control": "no-store" } });
});
