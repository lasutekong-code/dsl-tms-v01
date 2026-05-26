import { redirect } from "next/navigation";

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
  const supabase = await createClient();
  const id = userId ?? (await supabase.auth.getUser()).data.user?.id;

  if (!id) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, is_active, full_name, email")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Failed to load profile", error);
    return null;
  }

  return data;
}

export async function requireProfile() {
  const profile = await getProfile();

  if (!profile) {
    redirect("/login");
  }

  return profile;
}
