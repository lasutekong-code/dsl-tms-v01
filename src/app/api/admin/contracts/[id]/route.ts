import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { insertAuditLog } from "@/lib/admin/audit-log";
import { getAdminOrResponse, omitUndefined } from "@/lib/admin/api-guard";
import { uploadContractFile } from "@/lib/admin/contract-file";
import { parseContractRequest } from "@/lib/admin/contract-request";
import {
  dateYmdOptionalSchema,
  dateYmdSchema,
  flattenZodErrors,
  optionalNullableTrimmedString,
  uuidString,
} from "@/lib/admin/zod-util";
import { createClient } from "@/lib/supabase/server";
import type { ContractRow } from "@/types/database";
import { isUuid } from "@/lib/vehicles/build-detail";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CONTRACT_TYPES = ["consignment", "vehicle_service", "shipper_cargo"] as const;
const CONTRACT_STATUSES = ["active", "terminated", "expired"] as const;

const updateSchema = z.object({
  vehicle_id: uuidString.optional(),
  owner_id: uuidString.optional(),
  client_id: uuidString.optional(),
  contract_type: z.enum(CONTRACT_TYPES).optional(),
  contract_start_date: dateYmdSchema.optional(),
  contract_end_date: dateYmdOptionalSchema.optional(),
  status: z.enum(CONTRACT_STATUSES).optional(),
  memo: optionalNullableTrimmedString,
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

  const parsedRequest = await parseContractRequest(request);
  if (!parsedRequest.ok) {
    return parsedRequest.response;
  }

  const parsed = updateSchema.safeParse(parsedRequest.data.body);
  if (!parsed.success) {
    return NextResponse.json({ error: "입력값을 확인해 주세요.", fields: flattenZodErrors(parsed.error) }, { status: 400 });
  }

  const patch = omitUndefined(parsed.data as Record<string, unknown>);
  const hasFile = Boolean(parsedRequest.data.file);

  if (Object.keys(patch).length === 0 && !hasFile) {
    return NextResponse.json({ error: "변경할 값이 없습니다." }, { status: 400 });
  }

  const supabase = await createClient();
  let data: ContractRow | null = null;

  if (Object.keys(patch).length > 0) {
    const { data: updated, error } = await supabase
      .from("contracts")
      .update(patch as Partial<ContractRow>)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error || !updated) {
      return NextResponse.json({ error: "수정에 실패했습니다." }, { status: 500 });
    }

    data = updated;

    await insertAuditLog(supabase, {
      profileId: gate.admin.profileId,
      userId: gate.admin.userId,
      action: "contract.update",
      targetTable: "contracts",
      targetId: id,
      vehicleId: updated.vehicle_id,
      metadata: {},
    });
  } else {
    const { data: existing } = await supabase.from("contracts").select("*").eq("id", id).maybeSingle();
    if (!existing) {
      return NextResponse.json({ error: "계약을 찾을 수 없습니다." }, { status: 404 });
    }

    data = existing;
  }

  if (parsedRequest.data.file) {
    const fileResult = await uploadContractFile(supabase, id, parsedRequest.data.file, gate.admin);
    if ("error" in fileResult && fileResult.error) {
      return NextResponse.json({ error: fileResult.error }, { status: 500 });
    }

    data = fileResult.data ?? data;
  }

  return NextResponse.json({ data });
}
