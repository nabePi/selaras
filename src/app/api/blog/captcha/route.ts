import { createCaptcha } from "@/lib/server/captcha";
import { ok, publicRoute } from "@/lib/server/route";

export const GET = publicRoute(async () => ok(createCaptcha(), { headers: { "Cache-Control": "no-store" } }));
