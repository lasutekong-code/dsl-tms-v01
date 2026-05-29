import { NextRequest, NextResponse } from "next/server";

import { getAdminOrResponse } from "@/lib/admin/api-guard";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/vehicles/build-detail";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const gate = await getAdminOrResponse();
  if (!gate.ok) {
    return gate.response;
  }

  const targetTable = request.nextUrl.searchParams.get("target_table")?.trim();
  const targetId = request.nextUrl.searchParams.get("target_id")?.trim();
  const limitRaw = Number.parseInt(request.nextUrl.searchParams.get("limit") ?? "20", 10);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 100) : 20;

  if (!targetTable || !targetId || !isUuid(targetId)) {
    return NextResponse.json({ error: "target_table과 target_id가 필요합니다." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("id, action, profile_id, created_at")
    .eq("target_table", targetTable)
    .eq("target_id", targetId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: "이력 조회에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? [] });
}
