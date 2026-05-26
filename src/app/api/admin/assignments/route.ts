import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { insertAuditLog } from "@/lib/admin/audit-log";
import { getAdminOrResponse } from "@/lib/admin/api-guard";
import { dateYmdOptionalSchema, dateYmdSchema, flattenZodErrors, uuidString } from "@/lib/admin/zod-util";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  vehicle_id: uuidString,
  client_id: uuidString,
  center_id: uuidString,
  driver_id: uuidString,
  owner_id: uuidString,
  start_date: dateYmdSchema,
  end_date: dateYmdOptionalSchema,
  is_current: z.boolean().optional().default(true),
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
    client_id: parsed.data.client_id,
    center_id: parsed.data.center_id,
    driver_id: parsed.data.driver_id,
    owner_id: parsed.data.owner_id,
    start_date: parsed.data.start_date,
    end_date: parsed.data.end_date ?? null,
    is_current: parsed.data.is_current ?? true,
  };

  const { data, error } = await supabase.from("vehicle_assignments").insert(insertRow).select("*").single();

  if (error || !data) {
    return NextResponse.json({ error: "저장 중 오류가 발생했습니다." }, { status: 500 });
  }

  await insertAuditLog(supabase, {
    profileId: gate.admin.profileId,
    userId: gate.admin.userId,
    action: "vehicle_assignment.create",
    targetTable: "vehicle_assignments",
    targetId: data.id,
    vehicleId: data.vehicle_id,
    metadata: {},
  });

  return NextResponse.json({ data });
}
