import { adminRoute, ok, readJson } from "@/lib/server/route";
import { courseSchema, createCourse, listCourses } from "@/server/admin/courses";

export const GET = adminRoute(async () => ok(await listCourses()));

export const POST = adminRoute(async ({ request }) =>
  ok(await createCourse(await readJson(request, courseSchema)), { status: 201 }),
);
