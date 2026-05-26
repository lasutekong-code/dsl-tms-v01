import { createClient } from "@/lib/supabase/server";
import {
  PROFILE_COLUMNS,
  type ProfileRow,
  type ProfileRole,
} from "@/types/database";
import { isProfileRole } from "@/lib/auth/role-redirect";

export type AuthProfile = ProfileRow;

export async function getProfile(): Promise<AuthProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  if (!isProfileRole(data.role)) {
    console.error("[get-profile] invalid role:", data.role);
    return null;
  }

  return { ...data, role: data.role as ProfileRole };
}
