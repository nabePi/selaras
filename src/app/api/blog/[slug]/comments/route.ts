import { verifyCaptcha } from "@/lib/server/captcha";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";
import { ok, publicRoute, readJson } from "@/lib/server/route";
import { addComment, commentSchema } from "@/server/blog";
import { getBlogUser } from "@/server/blog-actor";

export const POST = publicRoute<{ slug: string }>(async ({ request, params }) => {
  rateLimit(`comment:${clientIp(request)}`, 5, 60_000);
  const input = await readJson(request, commentSchema);
  const user = await getBlogUser();
  // Pengunjung yang belum masuk berkomentar sebagai "Anonim" dan wajib menjawab captcha.
  if (!user) verifyCaptcha(input.captchaToken, input.captchaAnswer);
  return ok(await addComment(params.slug, input.body, user), { status: 201 });
});
