import { type NextRequest, NextResponse } from "next/server";

import { updateSupabaseSession } from "@/lib/supabase/proxy-session";

const AUTH_REQUIRED_PREFIXES = ["/vehicles", "/search", "/dashboard", "/admin"];
const AUTH_EXEMPT_PATHS = ["/login", "/auth", "/api/auth"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { response, user } = await updateSupabaseSession(request);

  const requiresAuth =
    AUTH_REQUIRED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)) &&
    !AUTH_EXEMPT_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  if (requiresAuth && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
