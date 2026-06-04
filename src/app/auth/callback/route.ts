import { NextRequest, NextResponse } from "next/server";

import { createRouteHandlerClient } from "@/lib/supabase/route-handler";

export const dynamic = "force-dynamic";

function safeNextPath(value: string | null): string {
  if (!value) {
    return "/login/reset-password";
  }

  const trimmed = value.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return "/login/reset-password";
  }

  return trimmed;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNextPath(url.searchParams.get("next"));
  const origin = url.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=invalid`);
  }

  const response = NextResponse.redirect(`${origin}${next}`);
  const supabase = createRouteHandlerClient(request, response);
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=invalid`);
  }

  return response;
}
