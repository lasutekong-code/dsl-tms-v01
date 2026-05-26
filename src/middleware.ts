import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { redirectWithSessionCookies } from "@/lib/supabase/middleware-redirect";
import { createServerClient } from "@supabase/ssr";
import { fetchProfileByUserId } from "@/lib/auth/fetch-profile";
import type { Database, ProfileRole } from "@/types/database";

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

  const sessionResponse = await updateSession(request);

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return sessionResponse;
  }

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            sessionResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return redirectWithSessionCookies(request, sessionResponse, "/login");
  }

  const profileResult = await fetchProfileByUserId(supabase, authUser.id);

  if (!profileResult.ok) {
    await supabase.auth.signOut();
    return redirectWithSessionCookies(request, sessionResponse, "/login", {
      error: "access_denied",
    });
  }

  const { profile } = profileResult;

  if (!profile.is_active) {
    await supabase.auth.signOut();
    return redirectWithSessionCookies(request, sessionResponse, "/login", {
      error: "inactive",
    });
  }

  const role = profile.role as ProfileRole;

  if (pathname.startsWith("/admin") && role !== "admin") {
    return redirectWithSessionCookies(request, sessionResponse, "/search");
  }

  return sessionResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
