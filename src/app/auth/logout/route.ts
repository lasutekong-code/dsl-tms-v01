import { NextRequest, NextResponse } from "next/server";

import { createRouteHandlerClient } from "@/lib/supabase/route-handler";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const response = NextResponse.redirect(new URL("/login", url.origin));
  const supabase = createRouteHandlerClient(request, response);
  await supabase.auth.signOut();
  return response;
}
