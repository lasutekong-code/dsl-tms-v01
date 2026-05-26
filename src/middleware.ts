import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createServerClient } from "@supabase/ssr";
import {
  PROFILE_COLUMNS,
  type Database,
  type ProfileRole,
} from "@/types/database";
import { isProfileRole } from "@/lib/auth/role-redirect";

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
    return NextResponse.redirect(loginUrl);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", authUser.id)
    .maybeSingle();

  if (
    !profile ||
    !profile.is_active ||
    !isProfileRole(profile.role)
  ) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set(
      "error",
      profile && !profile.is_active ? "inactive" : "access_denied"
    );
    await supabase.auth.signOut();
    return NextResponse.redirect(loginUrl);
  }

  const role = profile.role as ProfileRole;

  if (pathname.startsWith("/admin") && role !== "admin") {
    const searchUrl = request.nextUrl.clone();
    searchUrl.pathname = "/search";
    return NextResponse.redirect(searchUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
