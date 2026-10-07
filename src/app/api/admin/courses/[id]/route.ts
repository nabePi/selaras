import { notFound } from "@/lib/server/errors";
import { adminRoute, ok, readJson } from "@/lib/server/route";
import { courseSchema, deleteCourse, getCourse, updateCourse } from "@/server/admin/courses";

type P = { id: string };

export const GET = adminRoute<P>(async ({ params }) => {
  const course = await getCourse(params.id);
  if (!course) throw notFound("Kelas");
  return ok(course);
});

export const PATCH = adminRoute<P>(async ({ request, params }) =>
  ok(await updateCourse(params.id, await readJson(request, courseSchema))),
);

export const DELETE = adminRoute<P>(async ({ params }) => ok(await deleteCourse(params.id)));
