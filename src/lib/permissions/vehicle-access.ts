import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";
import type { ProfileRow, UserRole } from "@/types/vehicle";

const ALLOWED_ROLES = new Set<UserRole>(["admin", "client_manager", "owner", "driver", "staff"]);

export function parseUserRole(role: string | null | undefined): UserRole | null {
  if (!role || !ALLOWED_ROLES.has(role as UserRole)) {
    return null;
  }

  return role as UserRole;
}

export async function canAccessVehicle(
  supabase: SupabaseClient<Database>,
  profile: ProfileRow,
  vehicleId: string,
): Promise<boolean> {
  const role = parseUserRole(profile.role);

  if (!role) {
    return false;
  }

  if (role === "admin") {
    return true;
  }

  if (role === "client_manager") {
    const { data: vehicle } = await supabase
      .from("vehicle_card_view")
      .select("client_id")
      .eq("vehicle_id", vehicleId)
      .maybeSingle();

    if (!vehicle?.client_id) {
      return false;
    }

    const { data: access } = await supabase
      .from("user_client_access")
      .select("client_id")
      .eq("user_id", profile.id)
      .eq("client_id", vehicle.client_id)
      .maybeSingle();

    return Boolean(access);
  }

  const { data: access } = await supabase
    .from("user_vehicle_access")
    .select("vehicle_id")
    .eq("user_id", profile.id)
    .eq("vehicle_id", vehicleId)
    .maybeSingle();

  return Boolean(access);
}

export async function resolveCanViewSensitive(
  supabase: SupabaseClient<Database>,
  profile: ProfileRow,
  vehicleId: string,
  clientId: string | null,
): Promise<boolean> {
  const role = parseUserRole(profile.role);

  if (!role || role === "client_manager") {
    return false;
  }

  if (role === "admin") {
    return true;
  }

  if (clientId) {
    const { data: clientAccess } = await supabase
      .from("user_client_access")
      .select("can_view_sensitive")
      .eq("user_id", profile.id)
      .eq("client_id", clientId)
      .maybeSingle();

    if (clientAccess?.can_view_sensitive) {
      return true;
    }
  }

  const { data: vehicleAccess } = await supabase
    .from("user_vehicle_access")
    .select("can_view_sensitive")
    .eq("user_id", profile.id)
    .eq("vehicle_id", vehicleId)
    .maybeSingle();

  return vehicleAccess?.can_view_sensitive === true;
}
