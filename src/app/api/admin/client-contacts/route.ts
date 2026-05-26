import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { insertAuditLog } from "@/lib/admin/audit-log";
import { getAdminOrResponse } from "@/lib/admin/api-guard";
import {
  flattenZodErrors,
  phoneOptionalSchema,
  requiredTrimmed,
  uuidString,
} from "@/lib/admin/zod-util";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const optionalUuid = z
  .string()
  .trim()
  .optional()
  .transform((v) => (!v ? null : v))
  .pipe(z.union([z.null(), z.string().uuid("올바른 ID가 아닙니다.")]));

const createSchema = z.object({
  client_id: uuidString,
  center_id: optionalUuid,
  contact_name: requiredTrimmed("담당자명"),
  phone: phoneOptionalSchema,
  email: z
    .string()
    .trim()
    .optional()
    .transform((v) => (!v ? null : v))
    .pipe(z.union([z.null(), z.string().email("이메일 형식이 올바르지 않습니다.")])),
  profile_id: optionalUuid,
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
    center_id: parsed.data.center_id,
    contact_name: parsed.data.contact_name,
    phone: parsed.data.phone ?? null,
    email: parsed.data.email ?? null,
    profile_id: parsed.data.profile_id,
    is_active: parsed.data.is_active ?? true,
  };

  const { data, error } = await supabase.from("client_contacts").insert(insertRow).select("*").single();

  if (error || !data) {
    return NextResponse.json({ error: "저장 중 오류가 발생했습니다." }, { status: 500 });
  }

  await insertAuditLog(supabase, {
    profileId: gate.admin.profileId,
    userId: gate.admin.userId,
    action: "client_contact.create",
    targetTable: "client_contacts",
    targetId: data.id,
    metadata: { contact_name: data.contact_name },
  });

  return NextResponse.json({ data });
}
