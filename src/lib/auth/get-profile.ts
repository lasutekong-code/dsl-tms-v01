import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type { Profile } from "@/lib/auth/profile-types";
export { getRoleHomePath, roleLabels } from "@/lib/auth/profile-types";

export async function getProfile(userId?: string) {
  const supabase = await createClient();
  const id = userId ?? (await supabase.auth.getUser()).data.user?.id;

  if (!id) {
    return null;
  }

  const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single();

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

  if (profile.is_active === false) {
    redirect("/login?error=inactive");
  }

  return profile;
}
