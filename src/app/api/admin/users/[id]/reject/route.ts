import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { insertAuditLog } from "@/lib/admin/audit-log";
import { getAdminOrResponse } from "@/lib/admin/api-guard";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/vehicles/build-detail";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  reason: z.string().trim().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  const gate = await getAdminOrResponse();
  if (!gate.ok) {
    return gate.response;
  }

  const { id } = await context.params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "잘못된 사용자 ID입니다." }, { status: 400 });
  }

  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const parsed = bodySchema.safeParse(body);
  const reason = parsed.success ? parsed.data.reason : undefined;

  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data: profile, error } = await supabase
    .from("profiles")
    .update({ is_active: false, updated_at: now })
    .eq("id", id)
    .select("id, role, name, email, is_active")
    .maybeSingle();

  if (error || !profile) {
    return NextResponse.json({ error: "거절 처리에 실패했습니다." }, { status: 500 });
  }

  await supabase
    .from("account_requests")
    .update({
      status: "rejected",
      reviewed_by: gate.admin.profileId,
      reviewed_at: now,
      updated_at: now,
      message: reason ?? "관리자 거절",
    })
    .eq("profile_id", id)
    .in("status", ["pending", "approved"]);

  await insertAuditLog(supabase, {
    profileId: gate.admin.profileId,
    userId: gate.admin.userId,
    action: "update",
    targetTable: "profiles",
    targetId: id,
    metadata: { reason: reason ?? null },
  });

  return NextResponse.json({ data: profile });
}
