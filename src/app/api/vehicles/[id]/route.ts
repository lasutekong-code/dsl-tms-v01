import { NextRequest, NextResponse } from "next/server";

import { buildVehicleDetailFromView, isUuid } from "@/lib/vehicles/build-detail";
import {
  collectViewedSensitiveFields,
  sanitizeVehicleDetail,
} from "@/lib/vehicles/sanitize-detail";
import { MOCK_VEHICLE_DETAIL } from "@/lib/vehicles/mock-detail";
import {
  canAccessVehicle,
  parseUserRole,
  resolveCanViewSensitive,
} from "@/lib/permissions/vehicle-access";
import { createClient } from "@/lib/supabase/server";
import type { VehicleDetail } from "@/types/vehicle";

export const dynamic = "force-dynamic";

const USE_MOCK = process.env.VEHICLE_DETAIL_USE_MOCK === "true";

function getRequestMeta(request: NextRequest) {
  return {
    ip_address: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    user_agent: request.headers.get("user-agent"),
  };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  if (!isUuid(id)) {
    return NextResponse.json({ error: "Invalid vehicle id." }, { status: 400 });
  }

  if (USE_MOCK) {
    const mock = sanitizeVehicleDetail(
      { ...MOCK_VEHICLE_DETAIL, vehicle_id: id },
      "admin",
      true,
    );
    return NextResponse.json(mock.detail satisfies VehicleDetail);
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, is_active, full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json({ error: "Failed to load profile." }, { status: 500 });
  }

  if (!profile) {
    return NextResponse.json({ error: "Profile not found." }, { status: 403 });
  }

  if (profile.is_active === false) {
    return NextResponse.json({ error: "Account is inactive.", code: "inactive" }, { status: 403 });
  }

  const role = parseUserRole(profile.role);

  if (!role) {
    return NextResponse.json({ error: "Role is not allowed." }, { status: 403 });
  }

  const hasAccess = await canAccessVehicle(supabase, profile, id);

  if (!hasAccess) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { data: viewRow, error: viewError } = await supabase
    .from("vehicle_card_view")
    .select("*")
    .eq("vehicle_id", id)
    .maybeSingle();

  if (viewError) {
    return NextResponse.json({ error: "Failed to load vehicle." }, { status: 500 });
  }

  if (!viewRow) {
    return NextResponse.json({ error: "Vehicle not found." }, { status: 404 });
  }

  const detail = await buildVehicleDetailFromView(supabase, viewRow);
  const canViewSensitive = await resolveCanViewSensitive(
    supabase,
    profile,
    id,
    detail.client_id,
  );

  detail.can_view_sensitive = canViewSensitive;

  const { detail: sanitized, sensitiveFields } = sanitizeVehicleDetail(detail, role, canViewSensitive);

  const viewedSensitive = collectViewedSensitiveFields(detail, role);

  if (viewedSensitive.length > 0 || sensitiveFields.length > 0) {
    const meta = getRequestMeta(request);
    await supabase.from("audit_logs").insert({
      profile_id: profile.id,
      user_id: profile.id,
      vehicle_id: id,
      action: "view_vehicle_detail",
      sensitive_fields: [...new Set([...viewedSensitive, ...sensitiveFields])],
      ip_address: meta.ip_address,
      user_agent: meta.user_agent,
      target_table: "vehicles",
      target_id: id,
    });
  }

  return NextResponse.json(sanitized satisfies VehicleDetail);
}
