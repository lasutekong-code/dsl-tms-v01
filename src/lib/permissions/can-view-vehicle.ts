import type { Profile } from "@/lib/auth/profile-display";
import { canAccessVehicle } from "@/lib/permissions/vehicle-access";
import { createClient } from "@/lib/supabase/server";

export async function canViewVehicle(profile: Profile, vehicleId: string) {
  const supabase = await createClient();
  return canAccessVehicle(supabase, profile, vehicleId);
}
