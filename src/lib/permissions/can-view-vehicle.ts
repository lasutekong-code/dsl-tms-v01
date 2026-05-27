import type { Profile } from "@/lib/auth/profile-display";
import { canAccessVehicle } from "@/lib/permissions/vehicle-access";
import { createClient } from "@/lib/supabase/server";

export async function canViewVehicle(profile: Profile, vehicleId: string) {
  const supabase = await createClient();
  return canAccessVehicle(
    supabase,
    {
      id: profile.id,
      role: profile.role,
      is_active: profile.is_active,
      name: profile.full_name,
      email: profile.email,
    },
    vehicleId,
  );
}
