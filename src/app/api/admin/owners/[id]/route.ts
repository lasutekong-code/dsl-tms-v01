import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { insertAuditLog } from "@/lib/admin/audit-log";
import { getAdminOrResponse } from "@/lib/admin/api-guard";
import {
  businessNoOptionalSchema,
  dateYmdOptionalSchema,
  flattenZodErrors,
  formatKoreanBusinessNo,
  normalizeBusinessNo,
  phoneSchema,
  requiredTrimmed,
} from "@/lib/admin/zod-util";
import { createClient } from "@/lib/supabase/server";
import type { OwnerRow } from "@/types/database";
import { isUuid } from "@/lib/vehicles/build-detail";

export const dynamic = "force-dynamic";

const optionalUuid = z
  .string()
  .trim()
  .optional()
  .transform((v) => (!v ? null : v))
  .pipe(z.union([z.null(), z.string().uuid("올바른 ID가 아닙니다.")]));

async function findDuplicateOwnerBusinessNo(
  supabase: Awaited<ReturnType<typeof createClient>>,
  normalized: string | null,
  excludeId?: string,
): Promise<string | null> {
  if (!normalized) {
    return null;
  }

  const { data: rows, error } = await supabase.from("owners").select("id, business_no");
  if (error) {
    return "사업자등록번호 중복 여부를 확인하지 못했습니다.";
  }

  for (const row of rows ?? []) {
    if (excludeId && row.id === excludeId) {
      continue;
    }

    if (normalizeBusinessNo(row.business_no) === normalized) {
      return "이미 등록된 사업자등록번호입니다.";
    }
  }

  return null;
}

const updateSchema = z.object({
  profile_id: optionalUuid.optional(),
  owner_name: requiredTrimmed("사업주명").optional(),
  owner_phone: phoneSchema.optional(),
  business_no: businessNoOptionalSchema.optional(),
  business_start_date: dateYmdOptionalSchema.optional(),
  business_closed_date: dateYmdOptionalSchema.optional(),
  vat_filing_enabled: z.boolean().optional(),
  service_fee_send_method: z.string().trim().optional().transform((v) => (!v ? null : v)),
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
  const patch: Record<string, unknown> = { ...parsed.data };

  if ("business_no" in patch) {
    const normalizedBn = normalizeBusinessNo(patch.business_no as string | null);
    const dupMsg = await findDuplicateOwnerBusinessNo(supabase, normalizedBn, id);
    if (dupMsg) {
      return NextResponse.json({ error: dupMsg, fields: { business_no: [dupMsg] } }, { status: 409 });
    }

    patch.business_no = normalizedBn ? formatKoreanBusinessNo(normalizedBn) : null;
  }

  const { data, error } = await supabase.from("owners").update(patch as Partial<OwnerRow>).eq("id", id).select("*").maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "수정에 실패했습니다." }, { status: 500 });
  }

  await insertAuditLog(supabase, {
    profileId: gate.admin.profileId,
    userId: gate.admin.userId,
    action: "owner.update",
    targetTable: "owners",
    targetId: id,
    metadata: { owner_name: data.owner_name },
  });

  return NextResponse.json({ data });
}
