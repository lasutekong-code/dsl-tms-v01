import { NextResponse } from "next/server";

import { insertAuditLog } from "@/lib/admin/audit-log";
import { getAdminOrResponse } from "@/lib/admin/api-guard";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/vehicles/build-detail";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const gate = await getAdminOrResponse();
  if (!gate.ok) {
    return gate.response;
  }

  const { id } = await context.params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "잘못된 사용자 ID입니다." }, { status: 400 });
  }

  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data: profile, error } = await supabase
    .from("profiles")
    .update({ is_active: true, updated_at: now })
    .eq("id", id)
    .select("id, role, name, email, is_active")
    .maybeSingle();

  if (error || !profile) {
    return NextResponse.json({ error: "승인 처리에 실패했습니다." }, { status: 500 });
  }

  await supabase
    .from("account_requests")
    .update({
      status: "approved",
      reviewed_by: gate.admin.profileId,
      reviewed_at: now,
      updated_at: now,
    })
    .eq("profile_id", id)
    .eq("status", "pending");

  await insertAuditLog(supabase, {
    profileId: gate.admin.profileId,
    userId: gate.admin.userId,
    action: "update",
    targetTable: "profiles",
    targetId: id,
    metadata: { email: profile.email, role: profile.role },
  });

  return NextResponse.json({ data: profile });
}
