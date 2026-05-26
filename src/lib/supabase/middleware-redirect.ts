import { NextResponse, type NextRequest } from "next/server";

/** updateSession 응답의 쿠키를 유지한 채 redirect 합니다. */
export function redirectWithSessionCookies(
  request: NextRequest,
  sessionResponse: NextResponse,
  pathname: string,
  searchParams?: Record<string, string>
): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      url.searchParams.set(key, value);
    }
  }

  const redirectResponse = NextResponse.redirect(url);

  sessionResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie.name, cookie.value);
  });

  return redirectResponse;
}
