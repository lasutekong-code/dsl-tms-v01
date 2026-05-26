import { createClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/types/database";
import { fetchProfileByUserId } from "@/lib/auth/fetch-profile";

export type AuthProfile = ProfileRow;

export async function getProfile(): Promise<AuthProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const result = await fetchProfileByUserId(supabase, user.id);
  return result.ok ? result.profile : null;
}

/** 비활성 계정이면 세션을 제거합니다 (로그인 페이지용). */
export async function signOutIfInactiveProfile(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const result = await fetchProfileByUserId(supabase, user.id);

  if (result.ok && !result.profile.is_active) {
    await supabase.auth.signOut();
    return true;
  }

  return false;
}
