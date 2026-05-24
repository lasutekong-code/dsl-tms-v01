import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/auth/get-profile";

export async function canViewVehicle(profile: Profile, vehicleId: string) {
  if (profile.role === "admin") {
    return true;
  }

  const supabase = await createClient();

  if (profile.role === "client_contact") {
    const { data: assignment } = await supabase
      .from("vehicle_assignments")
      .select("client_id")
      .eq("vehicle_id", vehicleId)
      .not("client_id", "is", null)
      .maybeSingle();

    if (!assignment?.client_id) {
      return false;
    }

    const { data: access } = await supabase
      .from("user_client_access")
      .select("id")
      .eq("user_id", profile.id)
      .eq("client_id", assignment.client_id)
      .maybeSingle();

    return Boolean(access);
  }

  const { data: access } = await supabase
    .from("user_vehicle_access")
    .select("id")
    .eq("user_id", profile.id)
    .eq("vehicle_id", vehicleId)
    .maybeSingle();

  return Boolean(access);
}
