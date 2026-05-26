import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { insertAuditLog } from "@/lib/admin/audit-log";
import { getAdminOrResponse } from "@/lib/admin/api-guard";
import {optionalNullableTrimmedString, dateYmdSchema, flattenZodErrors, uuidString} from "@/lib/admin/zod-util";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  vehicle_id: uuidString,
  inspection_date: dateYmdSchema,
  inspection_type: optionalNullableTrimmedString,
  result: optionalNullableTrimmedString,
  memo: optionalNullableTrimmedString,
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
    vehicle_id: parsed.data.vehicle_id,
    inspection_date: parsed.data.inspection_date,
    inspection_type: parsed.data.inspection_type ?? null,
    result: parsed.data.result ?? null,
    memo: parsed.data.memo ?? null,
  };

  const { data, error } = await supabase.from("vehicle_inspections").insert(insertRow).select("*").single();

  if (error || !data) {
    return NextResponse.json({ error: "저장 중 오류가 발생했습니다." }, { status: 500 });
  }

  await insertAuditLog(supabase, {
    profileId: gate.admin.profileId,
    userId: gate.admin.userId,
    action: "vehicle_inspection.create",
    targetTable: "vehicle_inspections",
    targetId: data.id,
    vehicleId: data.vehicle_id,
    metadata: {},
  });

  return NextResponse.json({ data });
}
