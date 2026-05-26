import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { insertAuditLog } from "@/lib/admin/audit-log";
import { getAdminOrResponse } from "@/lib/admin/api-guard";
import { flattenZodErrors, nonNegativeIntOptional, uuidString } from "@/lib/admin/zod-util";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const specSchema = z.object({
  vehicle_id: uuidString,
  special_equipment: z.string().trim().optional().transform((v) => (!v ? null : v)),
  height_mm: nonNegativeIntOptional,
  length_mm: nonNegativeIntOptional,
  width_mm: nonNegativeIntOptional,
  max_load_kg: nonNegativeIntOptional,
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

  const parsed = specSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "입력값을 확인해 주세요.", fields: flattenZodErrors(parsed.error) }, { status: 400 });
  }

  const supabase = await createClient();
  const row = {
    vehicle_id: parsed.data.vehicle_id,
    special_equipment: parsed.data.special_equipment ?? null,
    height_mm: parsed.data.height_mm ?? null,
    length_mm: parsed.data.length_mm ?? null,
    width_mm: parsed.data.width_mm ?? null,
    max_load_kg: parsed.data.max_load_kg ?? null,
  };

  const { data: existing } = await supabase.from("vehicle_specs").select("id").eq("vehicle_id", row.vehicle_id).maybeSingle();

  let data;
  let error;

  if (existing?.id) {
    const res = await supabase.from("vehicle_specs").update(row).eq("id", existing.id).select("*").maybeSingle();
    data = res.data;
    error = res.error;
  } else {
    const res = await supabase.from("vehicle_specs").insert(row).select("*").single();
    data = res.data;
    error = res.error;
  }

  if (error || !data) {
    return NextResponse.json({ error: "차량 제원 저장에 실패했습니다." }, { status: 500 });
  }

  await insertAuditLog(supabase, {
    profileId: gate.admin.profileId,
    userId: gate.admin.userId,
    action: existing?.id ? "vehicle_spec.update" : "vehicle_spec.create",
    targetTable: "vehicle_specs",
    targetId: data.id,
    vehicleId: row.vehicle_id,
    metadata: { vehicle_id: row.vehicle_id },
  });

  return NextResponse.json({ data });
}
