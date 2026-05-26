import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { insertAuditLog } from "@/lib/admin/audit-log";
import { getAdminOrResponse } from "@/lib/admin/api-guard";
import {optionalNullableTrimmedString, flattenZodErrors, requiredTrimmed, uuidString} from "@/lib/admin/zod-util";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const VIS = ["admin_only", "internal", "shared"] as const;

const createSchema = z.object({
  vehicle_id: uuidString,
  memo_type: optionalNullableTrimmedString,
  content: requiredTrimmed("메모 내용"),
  visibility: z.enum(VIS).optional().default("internal"),
});

export async function POST(request: NextRequest) {
  const gate = await getAdminOrResponse();
  if (!gate.ok) {
    return gate.response;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON 본문이 필요합니다." }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "입력값을 확인해 주세요.", fields: flattenZodErrors(parsed.error) }, { status: 400 });
  }

  const supabase = await createClient();
  const insertRow = {
    target_table: "vehicles",
    target_id: parsed.data.vehicle_id,
    memo_type: parsed.data.memo_type ?? null,
    content: parsed.data.content,
    visibility: parsed.data.visibility ?? "internal",
  };

  const { data, error } = await supabase.from("memos").insert(insertRow).select("*").single();

  if (error || !data) {
    return NextResponse.json({ error: "저장 중 오류가 발생했습니다." }, { status: 500 });
  }

  await insertAuditLog(supabase, {
    profileId: gate.admin.profileId,
    userId: gate.admin.userId,
    action: "memo.create",
    targetTable: "memos",
    targetId: data.id,
    vehicleId: parsed.data.vehicle_id,
    metadata: {},
  });

  return NextResponse.json({ data });
}
