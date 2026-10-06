import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "selaras_admin_session";

/**
 * Pemeriksaan optimistis saja: ada tidaknya cookie sesi. Validasi sesi dan role ADMIN yang
 * sebenarnya dilakukan di layout/halaman (`requireAdminPage`) dan route handler (`adminRoute`).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

  // Halaman login admin menangani sendiri sesi admin yang sudah ada.
  if (!hasSession && pathname !== "/admin/masuk") {
    return NextResponse.redirect(new URL("/admin/masuk", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: "/admin/:path*" };
