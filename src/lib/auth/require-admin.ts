import { createClient } from "@/lib/supabase/server";

export type AdminSession =
  | { ok: true; userId: string; profileId: string; loginId: string }
  | { ok: false; reason: "unauthenticated" | "forbidden" };

/**
 * Server-only: resolves current user and verifies active admin profile.
 */
export async function requireAdmin(): Promise<AdminSession> {
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
    .select("id, role, is_active, email")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile || profile.is_active === false || profile.role !== "admin") {
    return { ok: false, reason: "forbidden" };
  }

  const loginId = profile.email?.trim() || user.email?.trim() || user.id;

  return { ok: true, userId: user.id, profileId: profile.id, loginId };
}
