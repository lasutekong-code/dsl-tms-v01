import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { insertAuditLog } from "@/lib/admin/audit-log";
import { getAdminOrResponse } from "@/lib/admin/api-guard";
import {
  flattenZodErrors,
  optionalNullableTrimmedString,
  uuidString,
} from "@/lib/admin/zod-util";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const TARGETS = ["owners", "drivers"] as const;
const ADDRESS_TYPES = ["home", "mailing"] as const;

const createSchema = z.object({
  target_table: z.enum(TARGETS),
  target_id: uuidString,
  address_type: z.enum(ADDRESS_TYPES),
  zip_code: optionalNullableTrimmedString,
  address1: optionalNullableTrimmedString,
  address2: optionalNullableTrimmedString,
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
  const { data: existing } = await supabase
    .from("addresses")
    .select("id")
    .eq(parsed.data.target_table === "owners" ? "owner_id" : "driver_id", parsed.data.target_id)
    .eq("address_type", parsed.data.address_type)
    .maybeSingle();

  const row = {
    owner_id: parsed.data.target_table === "owners" ? parsed.data.target_id : null,
    driver_id: parsed.data.target_table === "drivers" ? parsed.data.target_id : null,
    address_type: parsed.data.address_type,
    zip_code: parsed.data.zip_code ?? null,
    address1: parsed.data.address1 ?? null,
    address2: parsed.data.address2 ?? null,
  };

  const op = existing?.id
    ? supabase.from("addresses").update(row).eq("id", existing.id).select("*").maybeSingle()
    : supabase.from("addresses").insert(row).select("*").single();

  const { data, error } = await op;

  if (error || !data) {
    return NextResponse.json({ error: "주소 저장에 실패했습니다." }, { status: 500 });
  }

  await insertAuditLog(supabase, {
    profileId: gate.admin.profileId,
    userId: gate.admin.userId,
    action: existing?.id ? "address.update" : "address.create",
    targetTable: "addresses",
    targetId: data.id,
    metadata: {
      target_table: parsed.data.target_table,
      target_id: parsed.data.target_id,
    },
  });

  return NextResponse.json({ data });
}
