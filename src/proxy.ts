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

  // 인증 확인 (하이브리드 - 성능 최적화):
  // 1) getClaims() 로 액세스 토큰을 로컬 검증한다. 이 프로젝트는 비대칭(ES256)
  //    서명 키를 사용하므로, 전역 캐시된 JWKS 만으로 네트워크 왕복 없이 검증된다.
  //    (토큰이 유효한 대부분의 요청은 여기서 끝나 Supabase Auth 왕복이 사라진다.)
  // 2) 토큰이 만료/무효/부재여서 로컬 검증이 실패한 경우에만 getUser() 로 폴백한다.
  //    getUser() 는 네트워크 호출이며 동시에 refresh 토큰으로 세션 갱신을 트리거하므로,
  //    토큰 만료 시점에도 세션이 끊기지 않고 유지된다.
  const { data: claimsData } = await supabase.auth.getClaims();
  let isAuthenticated = Boolean(claimsData?.claims);

  if (!isAuthenticated) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    isAuthenticated = Boolean(user);
  }

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
