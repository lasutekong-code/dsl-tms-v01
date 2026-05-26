import type { SupabaseClient } from "@supabase/supabase-js";
import {
  PROFILE_COLUMNS,
  type Database,
  type ProfileRow,
} from "@/types/database";
import { isProfileRole } from "@/lib/auth/role-redirect";

export type ProfileLookupResult =
  | { ok: true; profile: ProfileRow }
  | { ok: false; reason: "not_found" | "invalid_role" | "db_error" };

/**
 * Auth 사용자 ID로 profiles 행을 조회합니다.
 * profiles.id === auth.users.id 전제.
 */
export async function fetchProfileByUserId(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<ProfileLookupResult> {
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("[fetch-profile]", error.message);
    return { ok: false, reason: "db_error" };
  }

  if (!data) {
    return { ok: false, reason: "not_found" };
  }

  if (!isProfileRole(data.role)) {
    console.error("[fetch-profile] invalid role:", data.role);
    return { ok: false, reason: "invalid_role" };
  }

  return {
    ok: true,
    profile: {
      ...data,
      role: data.role,
    },
  };
}
