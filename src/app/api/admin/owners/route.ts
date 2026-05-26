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

const createSchema = z.object({
  profile_id: optionalUuid,
  owner_name: requiredTrimmed("사업주명"),
  owner_phone: phoneSchema,
  business_no: businessNoOptionalSchema,
  business_start_date: dateYmdOptionalSchema,
  business_closed_date: dateYmdOptionalSchema,
  vat_filing_enabled: z.boolean().optional().default(false),
  service_fee_send_method: z.string().trim().optional().transform((v) => (!v ? null : v)),
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
  const normalizedBn = normalizeBusinessNo(parsed.data.business_no ?? null);
  const dupMsg = await findDuplicateOwnerBusinessNo(supabase, normalizedBn);
  if (dupMsg) {
    return NextResponse.json({ error: dupMsg, fields: { business_no: [dupMsg] } }, { status: 409 });
  }

  const insertRow = {
    profile_id: parsed.data.profile_id,
    owner_name: parsed.data.owner_name,
    owner_phone: parsed.data.owner_phone,
    business_no: normalizedBn ? formatKoreanBusinessNo(normalizedBn) : null,
    business_start_date: parsed.data.business_start_date ?? null,
    business_closed_date: parsed.data.business_closed_date ?? null,
    vat_filing_enabled: parsed.data.vat_filing_enabled ?? false,
    service_fee_send_method: parsed.data.service_fee_send_method ?? null,
    is_active: parsed.data.is_active ?? true,
  };

  const { data, error } = await supabase.from("owners").insert(insertRow).select("*").single();

  if (error || !data) {
    return NextResponse.json({ error: "저장 중 오류가 발생했습니다." }, { status: 500 });
  }

  await insertAuditLog(supabase, {
    profileId: gate.admin.profileId,
    userId: gate.admin.userId,
    action: "owner.create",
    targetTable: "owners",
    targetId: data.id,
    metadata: { owner_name: data.owner_name },
  });

  return NextResponse.json({ data });
}
