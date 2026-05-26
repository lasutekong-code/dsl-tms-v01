import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { insertAuditLog } from "@/lib/admin/audit-log";
import { getAdminOrResponse, omitUndefined } from "@/lib/admin/api-guard";
import {
  dateYmdOptionalSchema,
  flattenZodErrors,
  nonNegativeIntOptional,
  requiredTrimmed,
} from "@/lib/admin/zod-util";
import { createClient } from "@/lib/supabase/server";
import type { VehicleRow } from "@/types/database";
import { isUuid } from "@/lib/vehicles/build-detail";

export const dynamic = "force-dynamic";

const VEHICLE_STATUSES = ["active", "inactive", "suspended", "terminated"] as const;

async function findDuplicateVehicleNo(
  supabase: Awaited<ReturnType<typeof createClient>>,
  vehicleNo: string,
  excludeId?: string,
): Promise<string | null> {
  const target = vehicleNo.trim();
  const { data: rows, error } = await supabase.from("vehicles").select("id, vehicle_no");
  if (error) {
    return "차량번호 중복 여부를 확인하지 못했습니다.";
  }

  for (const row of rows ?? []) {
    if (excludeId && row.id === excludeId) {
      continue;
    }

    if ((row.vehicle_no ?? "").trim() === target) {
      return "이미 등록된 차량번호입니다.";
    }
  }

  return null;
}

const updateSchema = z.object({
  vehicle_no: requiredTrimmed("차량번호").optional(),
  car_name: z.string().trim().optional().transform((v) => (!v ? null : v)),
  registration_date: dateYmdOptionalSchema.optional(),
  model_year: nonNegativeIntOptional,
  vin: z.string().trim().optional().transform((v) => (!v ? null : v)),
  vehicle_model_type: z.string().trim().optional().transform((v) => (!v ? null : v)),
  tonnage: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.coerce.number().finite().nonnegative().optional(),
  ),
  status: z.enum(VEHICLE_STATUSES).optional(),
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

  if (typeof patch.vehicle_no === "string") {
    const dupMsg = await findDuplicateVehicleNo(supabase, patch.vehicle_no, id);
    if (dupMsg) {
      return NextResponse.json({ error: dupMsg, fields: { vehicle_no: [dupMsg] } }, { status: 409 });
    }

    patch.vehicle_no = patch.vehicle_no.trim();
  }

  const { data, error } = await supabase.from("vehicles").update(patch as Partial<VehicleRow>).eq("id", id).select("*").maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "수정에 실패했습니다." }, { status: 500 });
  }

  await insertAuditLog(supabase, {
    profileId: gate.admin.profileId,
    userId: gate.admin.userId,
    action: "vehicle.update",
    targetTable: "vehicles",
    targetId: id,
    vehicleId: id,
    metadata: { vehicle_no: data.vehicle_no },
  });

  return NextResponse.json({ data });
}
