import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { insertAuditLog } from "@/lib/admin/audit-log";
import { getAdminOrResponse } from "@/lib/admin/api-guard";
import {
  dateYmdOptionalSchema,
  flattenZodErrors,
  nonNegativeFloatOptional,
  optionalNullableTrimmedString,
  uuidString,
} from "@/lib/admin/zod-util";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  vehicle_id: uuidString,
  insurance_company: optionalNullableTrimmedString,
  insurance_rate: nonNegativeFloatOptional,
  renewal_date: dateYmdOptionalSchema,
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
    insurance_company: parsed.data.insurance_company ?? null,
    insurance_rate: parsed.data.insurance_rate ?? null,
    renewal_date: parsed.data.renewal_date ?? null,
    memo: parsed.data.memo ?? null,
  };

  const { data, error } = await supabase.from("insurances").insert(insertRow).select("*").single();

  if (error || !data) {
    return NextResponse.json({ error: "저장 중 오류가 발생했습니다." }, { status: 500 });
  }

  await insertAuditLog(supabase, {
    profileId: gate.admin.profileId,
    userId: gate.admin.userId,
    action: "insurance.create",
    targetTable: "insurances",
    targetId: data.id,
    vehicleId: data.vehicle_id,
    metadata: {},
  });

  return NextResponse.json({ data });
}
