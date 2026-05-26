import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import {
  canAccessApp,
  canAccessPath,
  requiredRoleForPath,
} from "@/lib/auth/roles";
import { createServerClient } from "@supabase/ssr";
import type { Database, UserRole } from "@/types/database";

const PUBLIC_PATHS = ["/login", "/auth/callback"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp)$/)
  ) {
    return NextResponse.next();
  }

  const response = await updateSession(request);

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return response;
  }

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {},
      },
    }
  );

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { data: appUser } = await supabase
    .from("users")
    .select("role, is_active")
    .eq("auth_user_id", authUser.id)
    .is("deleted_at", null)
    .maybeSingle();

  const role = appUser?.role as UserRole | undefined;

  if (!appUser?.is_active || !canAccessApp(role)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("error", "access_denied");
    await supabase.auth.signOut();
    return NextResponse.redirect(loginUrl);
  }

  if (!canAccessPath(pathname, role)) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/";
    homeUrl.searchParams.set("error", "forbidden");
    return NextResponse.redirect(homeUrl);
  }

  const required = requiredRoleForPath(pathname);
  if (required && role) {
    response.headers.set("x-user-role", role);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
