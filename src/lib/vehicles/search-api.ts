import type { SupabaseClient } from "@supabase/supabase-js";

import { maskPhone } from "@/lib/utils/mask-sensitive";
import type { Database } from "@/types/database";
import type {
  ClientAccessRow,
  UserRole,
  VehicleAccessRow,
  VehicleCardViewRow,
  VehicleSearchResult,
} from "@/types/vehicle";

export const ALLOWED_ROLES = new Set<UserRole>([
  "admin",
  "client_manager",
  "owner",
  "driver",
  "staff",
]);

export const SEARCH_SELECT_COLUMNS =
  "vehicle_id,client_id,vehicle_no,client_name,center_name,driver_name,driver_phone,car_name,tonnage,model_year,special_equipment,insurance_renewal_date,latest_inspection_date,status,can_view_sensitive" as const;

const SEARCHABLE_COLUMNS = ["client_name", "vehicle_no", "driver_name"] as const;

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

export function parseUserRole(role: string | null | undefined): UserRole | null {
  if (!role || !ALLOWED_ROLES.has(role as UserRole)) {
    return null;
  }

  return role as UserRole;
}

export function normalizeSearchQuery(rawQuery: string | null) {
  return rawQuery?.trim().slice(0, 100) ?? "";
}

export async function getAccessScope(
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

    const rows = (data ?? []) as ClientAccessRow[];

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

  const rows = (data ?? []) as VehicleAccessRow[];

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
  return new Map(rows.map((row) => [String(row[idKey]), row.can_view_sensitive === true]));
}

export function buildVehicleSearchFilter(query: string) {
  const pattern = quotePostgrestValue(`%${escapePostgresLikePattern(query)}%`);
  return SEARCHABLE_COLUMNS.map((column) => `${column}.ilike.${pattern}`).join(",");
}

function escapePostgresLikePattern(value: string) {
  return value.replace(/[\\%_]/g, (character) => `\\${character}`);
}

function quotePostgrestValue(value: string) {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

export function resolveCanViewSensitive(vehicle: VehicleCardViewRow, scope: AccessScope) {
  if (scope.kind === "all") {
    return vehicle.can_view_sensitive !== false;
  }

  if (scope.kind === "clients") {
    const clientId = vehicle.client_id ? String(vehicle.client_id) : "";
    const accessCanViewSensitive = clientId
      ? scope.canViewSensitiveByClientId.get(clientId)
      : false;

    return accessCanViewSensitive === true && vehicle.can_view_sensitive !== false;
  }

  const vehicleId = vehicle.vehicle_id ? String(vehicle.vehicle_id) : "";
  const accessCanViewSensitive = vehicleId
    ? scope.canViewSensitiveByVehicleId.get(vehicleId)
    : false;

  return accessCanViewSensitive === true && vehicle.can_view_sensitive !== false;
}

export function toVehicleSearchResult(
  row: VehicleCardViewRow,
  canViewSensitive: boolean,
): VehicleSearchResult {
  const driverPhone = canViewSensitive ? row.driver_phone : maskPhone(row.driver_phone);

  return {
    vehicle_id: row.vehicle_id,
    vehicle_no: row.vehicle_no,
    client_name: row.client_name,
    center_name: row.center_name,
    driver_name: row.driver_name,
    driver_phone: driverPhone,
    car_name: row.car_name,
    tonnage: row.tonnage,
    model_year: row.model_year,
    special_equipment: row.special_equipment,
    insurance_renewal_date: row.insurance_renewal_date,
    latest_inspection_date: row.latest_inspection_date,
    status: row.status,
    can_view_sensitive: canViewSensitive,
  };
}

export async function recordSearchLog(
  supabase: AppSupabaseClient,
  userId: string,
  query: string,
  resultCount: number,
) {
  const { error } = await supabase.from("search_logs").insert({
    user_id: userId,
    query,
    result_count: resultCount,
  });

  if (error) {
    console.error("Failed to record search log", error);
  }
}
