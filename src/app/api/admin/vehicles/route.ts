import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { insertAuditLog } from "@/lib/admin/audit-log";
import { getAdminOrResponse } from "@/lib/admin/api-guard";
import {
  dateYmdOptionalSchema,
  flattenZodErrors,
  nonNegativeIntOptional,
  requiredTrimmed,
} from "@/lib/admin/zod-util";
import { createClient } from "@/lib/supabase/server";

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

const createSchema = z.object({
  vehicle_no: requiredTrimmed("차량번호"),
  car_name: z.string().trim().optional().transform((v) => (!v ? null : v)),
  registration_date: dateYmdOptionalSchema,
  model_year: nonNegativeIntOptional,
  vin: z.string().trim().optional().transform((v) => (!v ? null : v)),
  vehicle_model_type: z.string().trim().optional().transform((v) => (!v ? null : v)),
  tonnage: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : v),
    z.coerce.number().finite().nonnegative().nullable().optional(),
  ),
  status: z.enum(VEHICLE_STATUSES).optional().default("active"),
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
  const dupMsg = await findDuplicateVehicleNo(supabase, parsed.data.vehicle_no);
  if (dupMsg) {
    return NextResponse.json({ error: dupMsg, fields: { vehicle_no: [dupMsg] } }, { status: 409 });
  }

  const insertRow = {
    vehicle_no: parsed.data.vehicle_no.trim(),
    car_name: parsed.data.car_name ?? null,
    registration_date: parsed.data.registration_date ?? null,
    model_year: parsed.data.model_year ?? null,
    vin: parsed.data.vin ?? null,
    vehicle_model_type: parsed.data.vehicle_model_type ?? null,
    tonnage: parsed.data.tonnage ?? null,
    status: parsed.data.status ?? "active",
  };

  const { data, error } = await supabase.from("vehicles").insert(insertRow).select("*").single();

  if (error || !data) {
    return NextResponse.json({ error: "저장 중 오류가 발생했습니다." }, { status: 500 });
  }

  await insertAuditLog(supabase, {
    profileId: gate.admin.profileId,
    userId: gate.admin.userId,
    action: "vehicle.create",
    targetTable: "vehicles",
    targetId: data.id,
    vehicleId: data.id,
    metadata: { vehicle_no: data.vehicle_no },
  });

  return NextResponse.json({ data });
}
