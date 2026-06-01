import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const url = new URL(request.url);
  return NextResponse.redirect(new URL("/login", url.origin));
}
