import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { getSupabaseConfig, isSupabaseConfigured } from "@/lib/supabase/config";
import type { Database } from "@/types/database";

const AUTH_REQUIRED_PREFIXES = ["/vehicles", "/search", "/dashboard", "/admin"];
const AUTH_EXEMPT_PATHS = ["/login", "/auth", "/api/auth"];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const { pathname } = request.nextUrl;

  if (!isSupabaseConfigured()) {
    return response;
  }

  const { anonKey, url } = getSupabaseConfig();
  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      // @supabase/ssr 의 setAll 콜백은 단일 인자(쿠키 배열)만 전달합니다.
      // 두 번째 `headers` 인자는 존재하지 않으므로 `Object.entries(headers)` 호출 시
      // TypeError 가 발생하여 쿠키 갱신이 실패합니다.
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // 중요: getUser() 호출이 토큰 갱신(refresh) 을 트리거합니다.
  // getClaims() 는 JWT 로컬 검증만 수행하여 만료 토큰을 갱신하지 못합니다.
  // 이 호출은 그대로 두어야 사이드메뉴 클릭 등 후속 네비게이션에서도 세션이 유지됩니다.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuthenticated = Boolean(user);

  const requiresAuth =
    AUTH_REQUIRED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)) &&
    !AUTH_EXEMPT_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  if (requiresAuth && !isAuthenticated) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * 아래 경로를 제외한 모든 요청에 적용합니다:
     * - _next/static  (정적 파일)
     * - _next/image   (이미지 최적화)
     * - favicon.ico, 이미지·폰트 파일
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2)$).*)",
  ],
};
