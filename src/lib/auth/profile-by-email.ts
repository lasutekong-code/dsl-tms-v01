import { createServiceRoleClient } from "@/lib/supabase/service-role";

export type ProfileEmailLookup = {
  id: string;
  email: string | null;
  is_active: boolean | null;
};

/** Looks up a profile by email using the service role (bypasses RLS). */
export async function getProfileByEmail(email: string): Promise<{
  profile: ProfileEmailLookup | null;
  lookupUnavailable: boolean;
}> {
  const service = createServiceRoleClient();
  if (!service) {
    return { profile: null, lookupUnavailable: true };
  }

  const { data } = await service
    .from("profiles")
    .select("id, email, is_active")
    .eq("email", email)
    .maybeSingle();

  return { profile: data, lookupUnavailable: false };
}
