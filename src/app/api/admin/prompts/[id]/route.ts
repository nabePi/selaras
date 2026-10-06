import { notFound } from "@/lib/server/errors";
import { adminRoute, ok, readJson } from "@/lib/server/route";
import { getPrompt, updatePrompt } from "@/server/admin/prompts";
import { promptSchema } from "@/server/admin/schemas";

type P = { id: string };

export const GET = adminRoute<P>(async ({ params }) => {
  const prompt = await getPrompt(params.id);
  if (!prompt) throw notFound("Prompt");
  return ok(prompt);
});

export const PATCH = adminRoute<P>(async ({ request, params }) =>
  ok(await updatePrompt(params.id, await readJson(request, promptSchema))),
);
