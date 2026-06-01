import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// 로그아웃은 세션을 폐기하는 부수효과가 있으므로 POST 로만 처리합니다.
// GET 으로 두면 <Link> prefetch, 브라우저/백신의 링크 스캐너 등이
// 사용자가 의도하지 않은 시점에 로그아웃을 트리거할 수 있습니다.
export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const url = new URL(request.url);
  return NextResponse.redirect(new URL("/login", url.origin), { status: 303 });
}
