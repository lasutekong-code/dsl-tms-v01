import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type { UserRole } from "@/types/vehicle";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export const roleLabels: Record<UserRole, string> = {
  admin: "관리자",
  client_manager: "거래처 담당",
  owner: "사업주",
  driver: "운전자",
  staff: "직원",
};

export function getRoleHomePath(role: string) {
  if (role === "admin") {
    return "/admin/vehicles";
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
