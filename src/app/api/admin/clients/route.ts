import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { insertAuditLog } from "@/lib/admin/audit-log";
import {
  businessNoOptionalSchema,
  flattenZodErrors,
  formatKoreanBusinessNo,
  normalizeBusinessNo,
  phoneOptionalSchema,
  requiredTrimmed,
} from "@/lib/admin/zod-util";
import { getAdminOrResponse } from "@/lib/admin/api-guard";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  client_name: requiredTrimmed("거래처명"),
  business_no: businessNoOptionalSchema,
  main_phone: phoneOptionalSchema,
  address: z.string().trim().optional().transform((v) => (!v ? null : v)),
  is_active: z.boolean().optional().default(true),
});

async function findDuplicateBusinessNo(
  supabase: Awaited<ReturnType<typeof createClient>>,
  normalized: string | null,
  excludeId?: string,
): Promise<string | null> {
  if (!normalized) {
    return null;
  }

  const { data: rows, error } = await supabase.from("clients").select("id, business_no");
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
  const dupMsg = await findDuplicateBusinessNo(supabase, normalizedBn);
  if (dupMsg) {
    return NextResponse.json({ error: dupMsg, fields: { business_no: [dupMsg] } }, { status: 409 });
  }

  const insertRow = {
    client_name: parsed.data.client_name,
    business_no: normalizedBn ? formatKoreanBusinessNo(normalizedBn) : null,
    main_phone: parsed.data.main_phone ?? null,
    address: parsed.data.address ?? null,
    is_active: parsed.data.is_active ?? true,
  };

  const { data, error } = await supabase.from("clients").insert(insertRow).select("*").single();

  if (error || !data) {
    return NextResponse.json({ error: "저장 중 오류가 발생했습니다." }, { status: 500 });
  }

  await insertAuditLog(supabase, {
    profileId: gate.admin.profileId,
    userId: gate.admin.userId,
    action: "client.create",
    targetTable: "clients",
    targetId: data.id,
    metadata: { client_name: data.client_name },
  });

  return NextResponse.json({ data });
}
