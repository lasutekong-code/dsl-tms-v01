import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { insertAuditLog } from "@/lib/admin/audit-log";
import { getAdminOrResponse } from "@/lib/admin/api-guard";
import {
  dateYmdOptionalSchema,
  flattenZodErrors,
  optionalNullableTrimmedString,
  optionalUuidSchema,
  phoneSchema,
  requiredTrimmed,
} from "@/lib/admin/zod-util";
import { decryptDriverRow, encryptDriverWrite } from "@/lib/admin/pii-transform";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  profile_id: optionalUuidSchema,
  driver_name: requiredTrimmed("운전자명"),
  birth_date: dateYmdOptionalSchema,
  phone: phoneSchema,
  driver_license_no: optionalNullableTrimmedString,
  cargo_license_no: optionalNullableTrimmedString,
  resident_registration_number: optionalNullableTrimmedString,
  is_active: z.boolean().optional().default(true),
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
  const insertRow = encryptDriverWrite({
    profile_id: parsed.data.profile_id,
    driver_name: parsed.data.driver_name,
    birth_date: parsed.data.birth_date ?? null,
    phone: parsed.data.phone,
    driver_license_no: parsed.data.driver_license_no ?? null,
    cargo_license_no: parsed.data.cargo_license_no ?? null,
    resident_registration_number: parsed.data.resident_registration_number ?? null,
    is_active: parsed.data.is_active ?? true,
  });

  const { data, error } = await supabase.from("drivers").insert(insertRow as never).select("*").single();

  if (error || !data) {
    return NextResponse.json({ error: "저장 중 오류가 발생했습니다." }, { status: 500 });
  }

  await insertAuditLog(supabase, {
    profileId: gate.admin.profileId,
    userId: gate.admin.userId,
    action: "driver.create",
    targetTable: "drivers",
    targetId: data.id,
    metadata: { driver_name: data.driver_name },
  });

  return NextResponse.json({ data: decryptDriverRow(data) });
}
