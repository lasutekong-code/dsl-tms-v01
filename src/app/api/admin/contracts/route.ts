import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { insertAuditLog } from "@/lib/admin/audit-log";
import { getAdminOrResponse } from "@/lib/admin/api-guard";
import {optionalNullableTrimmedString, dateYmdOptionalSchema, dateYmdSchema, flattenZodErrors, uuidString} from "@/lib/admin/zod-util";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const CONTRACT_TYPES = ["consignment", "service"] as const;
const CONTRACT_STATUSES = ["active", "terminated", "expired"] as const;

const createSchema = z.object({
  vehicle_id: uuidString,
  owner_id: uuidString,
  client_id: uuidString,
  contract_type: z.enum(CONTRACT_TYPES),
  contract_start_date: dateYmdSchema,
  contract_end_date: dateYmdOptionalSchema,
  status: z.enum(CONTRACT_STATUSES).optional().default("active"),
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
    owner_id: parsed.data.owner_id,
    client_id: parsed.data.client_id,
    contract_type: parsed.data.contract_type,
    contract_start_date: parsed.data.contract_start_date,
    contract_end_date: parsed.data.contract_end_date ?? null,
    status: parsed.data.status ?? "active",
    memo: parsed.data.memo ?? null,
  };

  const { data, error } = await supabase.from("contracts").insert(insertRow).select("*").single();

  if (error || !data) {
    return NextResponse.json({ error: "저장 중 오류가 발생했습니다." }, { status: 500 });
  }

  await insertAuditLog(supabase, {
    profileId: gate.admin.profileId,
    userId: gate.admin.userId,
    action: "contract.create",
    targetTable: "contracts",
    targetId: data.id,
    vehicleId: data.vehicle_id,
    metadata: {},
  });

  return NextResponse.json({ data });
}
