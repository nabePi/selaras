import { z } from "zod";
import { ok, publicRoute, readJson } from "@/lib/server/route";
import { destroySession } from "@/lib/server/session";

const schema = z.object({ scope: z.enum(["admin", "member"]) });

/** Keluar hanya dari sesi `scope` yang diminta; sesi lainnya di peramban yang sama tetap aktif. */
export const POST = publicRoute(async ({ request }) => {
  const { scope } = await readJson(request, schema);
  await destroySession(scope);
  return ok({ loggedOut: true });
});
