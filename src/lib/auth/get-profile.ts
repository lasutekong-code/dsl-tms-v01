import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Database, UserRole } from "@/types/database";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export const roleLabels: Record<UserRole, string> = {
  admin: "관리자",
  client_contact: "거래처 담당자",
  owner: "사업주",
  driver: "운전자"
};

export function getRoleHomePath(role: UserRole) {
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

  return profile;
}
