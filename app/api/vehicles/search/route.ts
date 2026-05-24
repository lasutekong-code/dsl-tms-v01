import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type {
  ClientAccessRow,
  UserRole,
  VehicleAccessRow,
  VehicleCard,
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

const ALLOWED_ROLES = new Set<UserRole>([
  "admin",
  "client_manager",
  "owner",
  "driver",
  "staff",
]);

const SEARCHABLE_COLUMNS = ["client_name", "vehicle_no", "driver_name"] as const;

const NULL_WHEN_RESTRICTED = [
  /(^|_)(address|birth|birthday|resident|license|bank|account|tax|identity|secret|token)(_|$)/i,
  /(^|_)(vin|chassis_no|registration_no|business_no|id_number)(_|$)/i,
];

const MASK_AS_EMAIL = /email/i;
const MASK_AS_PHONE = /(^|_)(phone|mobile|tel|contact)(_|$)/i;
const MASK_AS_NAME = /(^|_)(driver_name|owner_name|staff_name)(_|$)/i;

export async function GET(request: NextRequest) {
  try {
    const q = normalizeSearchQuery(request.nextUrl.searchParams.get("q"));

    if (!q) {
      return NextResponse.json({ error: "q query parameter is required." }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient(request);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json({ error: "Failed to load user profile." }, { status: 500 });
    }

    const role = parseUserRole(profile?.role);

    if (!role) {
      return NextResponse.json({ error: "User role is not allowed." }, { status: 403 });
    }

    const scope = await getAccessScope(supabase, user.id, role);

    if (scope.kind === "clients" && scope.clientIds.length === 0) {
      await recordSearchLog(supabase, user.id, role, q, 0, scope.kind);
      return NextResponse.json<VehicleCard[]>([]);
    }

    if (scope.kind === "vehicles" && scope.vehicleIds.length === 0) {
      await recordSearchLog(supabase, user.id, role, q, 0, scope.kind);
      return NextResponse.json<VehicleCard[]>([]);
    }

    let query = supabase
      .from("vehicle_card_view")
      .select("*")
      .or(buildVehicleSearchFilter(q));

    if (scope.kind === "clients") {
      query = query.in("client_id", scope.clientIds);
    }

    if (scope.kind === "vehicles") {
      query = query.in("vehicle_id", scope.vehicleIds);
    }

    const { data, error: searchError } = await query;

    if (searchError) {
      return NextResponse.json({ error: "Vehicle search failed." }, { status: 500 });
    }

    const vehicles = (data ?? []).map((vehicle) =>
      sanitizeVehicleCard(vehicle, canViewSensitive(vehicle, scope)),
    );

    await recordSearchLog(supabase, user.id, role, q, vehicles.length, scope.kind);

    return NextResponse.json<VehicleCard[]>(vehicles);
  } catch (error) {
    console.error("/api/vehicles/search failed", error);
    return NextResponse.json({ error: "Unexpected vehicle search error." }, { status: 500 });
  }
}

function normalizeSearchQuery(rawQuery: string | null) {
  return rawQuery?.trim().slice(0, 100) ?? "";
}

function parseUserRole(role: string | null | undefined): UserRole | null {
  if (!role || !ALLOWED_ROLES.has(role as UserRole)) {
    return null;
  }

  return role as UserRole;
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
      throw new Error(`Failed to load client access: ${error.message}`);
    }

    const rows = data ?? [];

    return {
      kind: "clients",
      role,
      clientIds: rows.map((row) => row.client_id),
      canViewSensitiveByClientId: mapSensitivity(rows, "client_id"),
    };
  }

  const { data, error } = await supabase
    .from("user_vehicle_access")
    .select("vehicle_id, can_view_sensitive")
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to load vehicle access: ${error.message}`);
  }

  const rows = data ?? [];

  return {
    kind: "vehicles",
    role,
    vehicleIds: rows.map((row) => row.vehicle_id),
    canViewSensitiveByVehicleId: mapSensitivity(rows, "vehicle_id"),
  };
}

function mapSensitivity<T extends ClientAccessRow | VehicleAccessRow>(
  rows: T[],
  idKey: keyof T,
) {
  return new Map(
    rows.map((row) => [
      String(row[idKey]),
      row.can_view_sensitive === true,
    ]),
  );
}

function buildVehicleSearchFilter(query: string) {
  const pattern = quotePostgrestValue(`%${escapePostgresLikePattern(query)}%`);
  return SEARCHABLE_COLUMNS.map((column) => `${column}.ilike.${pattern}`).join(",");
}

function escapePostgresLikePattern(value: string) {
  return value.replace(/[\\%_]/g, (character) => `\\${character}`);
}

function quotePostgrestValue(value: string) {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function canViewSensitive(vehicle: VehicleCard, scope: AccessScope) {
  if (scope.kind === "all") {
    return vehicle.can_view_sensitive !== false;
  }

  if (scope.kind === "clients") {
    const clientId = stringifyId(vehicle.client_id);
    const accessCanViewSensitive = clientId
      ? scope.canViewSensitiveByClientId.get(clientId)
      : false;

    return accessCanViewSensitive === true && vehicle.can_view_sensitive !== false;
  }

  const vehicleId = stringifyId(vehicle.vehicle_id);
  const accessCanViewSensitive = vehicleId
    ? scope.canViewSensitiveByVehicleId.get(vehicleId)
    : false;

  return accessCanViewSensitive === true && vehicle.can_view_sensitive !== false;
}

function stringifyId(value: unknown) {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return "";
}

function sanitizeVehicleCard(vehicle: VehicleCard, canView: boolean): VehicleCard {
  if (canView) {
    return vehicle;
  }

  return Object.fromEntries(
    Object.entries(vehicle).map(([key, value]) => [key, sanitizeField(key, value)]),
  ) as VehicleCard;
}

function sanitizeField(key: string, value: VehicleCard[string]) {
  if (value == null) {
    return value;
  }

  if (NULL_WHEN_RESTRICTED.some((pattern) => pattern.test(key))) {
    return null;
  }

  if (typeof value !== "string") {
    return value;
  }

  if (MASK_AS_EMAIL.test(key)) {
    return maskEmail(value);
  }

  if (MASK_AS_PHONE.test(key)) {
    return maskPhone(value);
  }

  if (MASK_AS_NAME.test(key)) {
    return maskName(value);
  }

  return value;
}

function maskEmail(value: string) {
  const [localPart, domain] = value.split("@");

  if (!localPart || !domain) {
    return maskName(value);
  }

  return `${localPart[0]}***@${domain}`;
}

function maskPhone(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.length < 4) {
    return "***";
  }

  return `${"*".repeat(Math.max(0, digits.length - 4))}${digits.slice(-4)}`;
}

function maskName(value: string) {
  const trimmed = value.trim();

  if (trimmed.length <= 1) {
    return "*";
  }

  return `${trimmed[0]}${"*".repeat(trimmed.length - 1)}`;
}

async function recordSearchLog(
  supabase: AppSupabaseClient,
  userId: string,
  role: UserRole,
  query: string,
  resultCount: number,
  scope: AccessScope["kind"],
) {
  const { error } = await supabase.from("search_logs").insert({
    user_id: userId,
    query,
    resource: "vehicles",
    role,
    result_count: resultCount,
    metadata: {
      route: "/api/vehicles/search",
      scope,
      searched_columns: [...SEARCHABLE_COLUMNS],
    },
  });

  if (error) {
    throw new Error(`Failed to record search log: ${error.message}`);
  }
}
