import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Next.js Middleware — Supabase 세션 토큰 자동 갱신
 *
 * @supabase/ssr 은 쿠키 기반으로 세션을 관리합니다.
 * Server Component 에서 createClient() → getUser() 를 호출하기 전에
 * 반드시 이 미들웨어에서 토큰을 갱신(refresh)해야 합니다.
 *
 * 이 파일이 없으면 세션이 살아있어도 Server Component 에서
 * 인증 실패로 판단하여 /login 으로 307 리다이렉트가 반복됩니다.
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Supabase 환경변수가 없으면 미들웨어 처리 없이 통과
  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // request 쿠키 갱신 (미들웨어 내 후속 처리용)
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        // 새 response 생성 후 응답 쿠키에도 반영
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // 세션 토큰 갱신 — getUser() 호출이 핵심입니다.
  // 이 호출이 없으면 Server Component 의 getUser() 가 만료된 토큰을 보게 됩니다.
  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * 아래 경로를 제외한 모든 요청에 미들웨어를 적용합니다:
     * - _next/static  (정적 파일)
     * - _next/image   (이미지 최적화)
     * - favicon.ico, 이미지·폰트 파일
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2)$).*)",
  ],
};
