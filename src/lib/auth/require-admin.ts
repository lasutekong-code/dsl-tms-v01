import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type AdminSession =
  | { ok: true; userId: string; profileId: string }
  | { ok: false; reason: "unauthenticated" | "forbidden" };

/**
 * Server-only: resolves current user and verifies active admin profile.
 */
export async function requireAdmin(): Promise<AdminSession> {
  if (!isSupabaseConfigured()) {
    return { ok: false, reason: "unauthenticated" };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, reason: "unauthenticated" };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile || profile.is_active === false || profile.role !== "admin") {
    return { ok: false, reason: "forbidden" };
  }

  return { ok: true, userId: user.id, profileId: profile.id };
}
