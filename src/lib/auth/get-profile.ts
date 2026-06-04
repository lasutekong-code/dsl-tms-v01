import { redirect } from "next/navigation";

import { mapProfileRow } from "@/lib/auth/map-profile-row";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type { Profile } from "./profile-display";
export { roleLabels } from "./profile-display";

export function getRoleHomePath(role: string) {
  if (role === "admin") {
    return "/admin";
  }

  return "/search";
}

export async function getProfile(userId?: string) {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createClient();
  const id = userId ?? (await supabase.auth.getUser()).data.user?.id;

  if (!id) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, is_active, name, email, phone")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Failed to load profile", error);
    return null;
  }

  return data ? mapProfileRow(data) : null;
}

export async function requireProfile() {
  if (!isSupabaseConfigured()) {
    redirect("/login?error=config");
  }

  const profile = await getProfile();

  if (!profile) {
    redirect("/login");
  }

  return profile;
}
