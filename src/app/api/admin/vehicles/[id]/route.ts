import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { insertAuditLog } from "@/lib/admin/audit-log";
import { getAdminOrResponse, omitUndefined } from "@/lib/admin/api-guard";
import {optionalNullableTrimmedString, dateYmdOptionalSchema,
  flattenZodErrors,
  nonNegativeIntOptional,
  requiredTrimmed,} from "@/lib/admin/zod-util";
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
  car_name: optionalNullableTrimmedString,
  registration_date: dateYmdOptionalSchema.optional(),
  model_year: nonNegativeIntOptional,
  vin: optionalNullableTrimmedString,
  vehicle_model_type: optionalNullableTrimmedString,
  tonnage: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.coerce.number().finite().nonnegative().optional(),
  ),
  special_equipment: optionalNullableTrimmedString,
  height_mm: nonNegativeIntOptional,
  length_mm: nonNegativeIntOptional,
  width_mm: nonNegativeIntOptional,
  max_load_kg: nonNegativeIntOptional,
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

  const parsedData = parsed.data;
  const specPatch = {
    special_equipment: parsedData.special_equipment,
    height_mm: parsedData.height_mm,
    length_mm: parsedData.length_mm,
    width_mm: parsedData.width_mm,
    max_load_kg: parsedData.max_load_kg,
  };
  const patch = omitUndefined({
    vehicle_no: parsedData.vehicle_no,
    car_name: parsedData.car_name,
    registration_date: parsedData.registration_date,
    model_year: parsedData.model_year,
    vin: parsedData.vin,
    vehicle_model_type: parsedData.vehicle_model_type,
    tonnage: parsedData.tonnage,
    status: parsedData.status,
  } as Record<string, unknown>) as Partial<VehicleRow>;

  const hasSpecPatch = Object.values(specPatch).some((value) => value !== undefined);

  if (Object.keys(patch).length === 0 && !hasSpecPatch) {
    return NextResponse.json({ error: "변경할 값이 없습니다." }, { status: 400 });
  }

  const supabase = await createClient();

  if (typeof patch.vehicle_no === "string") {
    const dupMsg = await findDuplicateVehicleNo(supabase, patch.vehicle_no, id);

    patch.vehicle_no = patch.vehicle_no.trim();
    void dupMsg;
  }

  const { data, error } =
    Object.keys(patch).length > 0
      ? await supabase.from("vehicles").update(patch).eq("id", id).select("*").maybeSingle()
      : await supabase.from("vehicles").select("*").eq("id", id).maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "수정에 실패했습니다." }, { status: 500 });
  }
  if (hasSpecPatch) {
    await supabase.from("vehicle_specs").upsert(
      {
        vehicle_id: id,
        special_equipment: typeof specPatch.special_equipment === "string" ? specPatch.special_equipment : null,
        height_mm: typeof specPatch.height_mm === "number" ? specPatch.height_mm : null,
        length_mm: typeof specPatch.length_mm === "number" ? specPatch.length_mm : null,
        width_mm: typeof specPatch.width_mm === "number" ? specPatch.width_mm : null,
        max_load_kg: typeof specPatch.max_load_kg === "number" ? specPatch.max_load_kg : null,
      },
      { onConflict: "vehicle_id" },
    );
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

  const warning =
    typeof patch.vehicle_no === "string" ? await findDuplicateVehicleNo(supabase, patch.vehicle_no, id) : null;
  return NextResponse.json({ data, warning: warning ?? null });
}
