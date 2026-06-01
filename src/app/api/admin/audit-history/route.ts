import { NextRequest, NextResponse } from "next/server";

import { getAdminOrResponse } from "@/lib/admin/api-guard";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/vehicles/build-detail";

export const dynamic = "force-dynamic";

type AuditRow = {
  id: string;
  action: string;
  profile_id: string | null;
  created_at: string | null;
  metadata: unknown;
};

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

  const supabase = createServiceRoleClient() ?? (await createClient());
  const { data, error } = await supabase
    .from("audit_logs")
    .select("id, action, profile_id, created_at, metadata")
    .eq("target_table", targetTable)
    .eq("target_id", targetId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: "이력 조회에 실패했습니다." }, { status: 500 });
  }

  const rows = (data ?? []) as AuditRow[];
  const profileIds = [...new Set(rows.map((row) => row.profile_id).filter((id): id is string => Boolean(id)))];
  const emailByProfile = new Map<string, string>();

  if (profileIds.length > 0) {
    const { data: profiles } = await supabase.from("profiles").select("id, email").in("id", profileIds);
    for (const profile of profiles ?? []) {
      if (profile.email?.trim()) {
        emailByProfile.set(profile.id, profile.email.trim());
      }
    }
  }

  return NextResponse.json({
    data: rows.map((row) => ({
      ...row,
      login_id: row.profile_id ? (emailByProfile.get(row.profile_id) ?? null) : null,
    })),
  });
}
