import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { insertAuditLog } from "@/lib/admin/audit-log";
import { getAdminOrResponse } from "@/lib/admin/api-guard";
import { flattenZodErrors, phoneOptionalSchema, requiredTrimmed, uuidString } from "@/lib/admin/zod-util";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  client_id: uuidString,
  center_name: requiredTrimmed("센터명"),
  address: z.string().trim().optional().transform((v) => (!v ? null : v)),
  phone: phoneOptionalSchema,
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
  const insertRow = {
    client_id: parsed.data.client_id,
    center_name: parsed.data.center_name,
    address: parsed.data.address ?? null,
    phone: parsed.data.phone ?? null,
    is_active: parsed.data.is_active ?? true,
  };

  const { data, error } = await supabase.from("centers").insert(insertRow).select("*").single();

  if (error || !data) {
    return NextResponse.json({ error: "저장 중 오류가 발생했습니다." }, { status: 500 });
  }

  await insertAuditLog(supabase, {
    profileId: gate.admin.profileId,
    userId: gate.admin.userId,
    action: "center.create",
    targetTable: "centers",
    targetId: data.id,
    metadata: { center_name: data.center_name },
  });

  return NextResponse.json({ data });
}
