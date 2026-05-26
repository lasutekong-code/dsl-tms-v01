import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { insertAuditLog } from "@/lib/admin/audit-log";
import { getAdminOrResponse, omitUndefined } from "@/lib/admin/api-guard";
import { flattenZodErrors } from "@/lib/admin/zod-util";
import { createClient } from "@/lib/supabase/server";
import type { AddressRow } from "@/types/database";
import { isUuid } from "@/lib/vehicles/build-detail";

export const dynamic = "force-dynamic";

const ADDRESS_TYPES = ["home", "mailing"] as const;

const updateSchema = z.object({
  address_type: z.enum(ADDRESS_TYPES).optional(),
  zip_code: z.string().trim().optional().transform((v) => (!v ? null : v)),
  address1: z.string().trim().optional().transform((v) => (!v ? null : v)),
  address2: z.string().trim().optional().transform((v) => (!v ? null : v)),
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

  const patch = omitUndefined(parsed.data as Record<string, unknown>);
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "변경할 값이 없습니다." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.from("addresses").update(patch as Partial<AddressRow>).eq("id", id).select("*").maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "수정에 실패했습니다." }, { status: 500 });
  }

  await insertAuditLog(supabase, {
    profileId: gate.admin.profileId,
    userId: gate.admin.userId,
    action: "address.update",
    targetTable: "addresses",
    targetId: id,
    metadata: {},
  });

  return NextResponse.json({ data });
}
