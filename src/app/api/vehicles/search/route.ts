import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

import { parseUserRole } from "@/lib/permissions/vehicle-access";
import { createClient } from "@/lib/supabase/server";
import { maskPhone } from "@/lib/utils/mask-sensitive";
import type { Database } from "@/types/database";
import type {
  ClientAccessRow,
  UserRole,
  VehicleAccessRow,
  VehicleCardRow,
} from "@/types/vehicle";

export const dynamic = "force-dynamic";

type AppSupabaseClient = SupabaseClient<Database>;

type AccessScope =
  | { kind: "all"; role: UserRole }
  | {
      kind: "clients";
      role: UserRole;
      clientIds: string[];
      canViewSensitiveByClientId: Map<string, boolean>;
    }
  | {
      kind: "vehicles";
      role: UserRole;
      vehicleIds: string[];
      canViewSensitiveByVehicleId: Map<string, boolean>;
    };

const SEARCHABLE_COLUMNS = ["client_name", "vehicle_no", "driver_name"] as const;

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim().slice(0, 100) ?? "";

  if (!q) {
    return NextResponse.json({ results: [] });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile || profile.is_active === false) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const role = parseUserRole(profile.role);

  if (!role) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const scope = await getAccessScope(supabase, profile.id, role);

  if (scope.kind === "clients" && scope.clientIds.length === 0) {
    return NextResponse.json({ results: [] });
  }

  if (scope.kind === "vehicles" && scope.vehicleIds.length === 0) {
    return NextResponse.json({ results: [] });
  }

  const pattern = quotePostgrestValue(`%${escapePostgresLikePattern(q)}%`);
  let query = supabase
    .from("vehicle_card_view")
    .select("*")
    .or(SEARCHABLE_COLUMNS.map((column) => `${column}.ilike.${pattern}`).join(","));

  if (scope.kind === "clients") {
    query = query.in("client_id", scope.clientIds);
  }

  if (scope.kind === "vehicles") {
    query = query.in("vehicle_id", scope.vehicleIds);
  }

  const { data, error } = await query.limit(50);

  if (error) {
    return NextResponse.json({ error: "Vehicle search failed." }, { status: 500 });
  }

  const results = (data ?? []).map((row) => mapSearchResult(row, role, scope));

  await supabase.from("search_logs").insert({ user_id: user.id, query: q });

  return NextResponse.json({ results });
}

async function getAccessScope(
  supabase: AppSupabaseClient,
  userId: string,
  role: UserRole,
): Promise<AccessScope> {
  if (role === "admin") {
    return { kind: "all", role };
  }

  if (role === "client_manager") {
    const { data, error } = await supabase
      .from("user_client_access")
      .select("client_id, can_view_sensitive")
      .eq("user_id", userId);

    if (error) {
      throw new Error(error.message);
    }

    const rows = (data ?? []) as ClientAccessRow[];

    return {
      kind: "clients",
      role,
      clientIds: rows.map((row) => row.client_id),
      canViewSensitiveByClientId: new Map(
        rows.map((row) => [row.client_id, row.can_view_sensitive === true]),
      ),
    };
  }

  const { data, error } = await supabase
    .from("user_vehicle_access")
    .select("vehicle_id, can_view_sensitive")
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as VehicleAccessRow[];

  return {
    kind: "vehicles",
    role,
    vehicleIds: rows.map((row) => row.vehicle_id),
    canViewSensitiveByVehicleId: new Map(
      rows.map((row) => [row.vehicle_id, row.can_view_sensitive === true]),
    ),
  };
}

function mapSearchResult(row: VehicleCardRow, role: UserRole, scope: AccessScope) {
  const canViewSensitive =
    role === "admin" ||
    (scope.kind === "vehicles" &&
      scope.canViewSensitiveByVehicleId.get(String(row.vehicle_id)) === true);

  const driverPhone =
    canViewSensitive && role !== "client_manager"
      ? (typeof row.driver_phone === "string" ? row.driver_phone : null)
      : maskPhone(typeof row.driver_phone === "string" ? row.driver_phone : null);

  return {
    id: String(row.vehicle_id),
    plateNumber: String(row.vehicle_no ?? "-"),
    vehicleNumber: typeof row.vehicle_no === "string" ? row.vehicle_no : null,
    vehicleType: typeof row.car_name === "string" ? row.car_name : null,
    clientName: typeof row.client_name === "string" ? row.client_name : null,
    centerName: typeof row.center_name === "string" ? row.center_name : null,
    driverId: row.driver_id ? String(row.driver_id) : null,
    driverName: typeof row.driver_name === "string" ? row.driver_name : null,
    driverPhone,
    vehiclePhotos: [],
    driverPhoto: null,
  };
}

function escapePostgresLikePattern(value: string) {
  return value.replace(/[\\%_]/g, (character) => `\\${character}`);
}

function quotePostgrestValue(value: string) {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}
