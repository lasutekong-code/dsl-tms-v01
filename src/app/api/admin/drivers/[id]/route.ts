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
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/vehicles/build-detail";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  profile_id: optionalUuidSchema.optional(),
  driver_name: requiredTrimmed("운전자명").optional(),
  birth_date: dateYmdOptionalSchema.optional(),
  phone: phoneSchema.optional(),
  driver_license_no: optionalNullableTrimmedString,
  cargo_license_no: optionalNullableTrimmedString,
  is_active: z.boolean().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const gate = await getAdminOrResponse();
  if (!gate.ok) {
    return gate.response;
  }

  const { id } = await context.params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "잘못된 ID입니다." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON 본문이 필요합니다." }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "입력값을 확인해 주세요.", fields: flattenZodErrors(parsed.error) }, { status: 400 });
  }

  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "변경할 값이 없습니다." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.from("drivers").update(parsed.data).eq("id", id).select("*").maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "수정에 실패했습니다." }, { status: 500 });
  }

  await insertAuditLog(supabase, {
    profileId: gate.admin.profileId,
    userId: gate.admin.userId,
    action: "driver.update",
    targetTable: "drivers",
    targetId: id,
    metadata: { driver_name: data.driver_name },
  });

  return NextResponse.json({ data });
}
