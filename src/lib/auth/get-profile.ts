import type { SupabaseClient } from "@supabase/supabase-js";

export const USER_ROLES = [
  "admin",
  "client_manager",
  "owner",
  "driver",
  "staff",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export interface Profile {
  id: string;
  role: UserRole;
  name: string;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function isUserRole(value: string): value is UserRole {
  return (USER_ROLES as readonly string[]).includes(value);
}

export function getRedirectPathForRole(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/admin/vehicles";
    case "client_manager":
    case "owner":
    case "driver":
    case "staff":
      return "/search";
    default: {
      const _exhaustive: never = role;
      return _exhaustive;
    }
  }
}

export async function getProfileByUserId(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ profile: Profile | null; error: string | null }> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, name, phone, email, is_active, created_at, updated_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return {
      profile: null,
      error: "프로필 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }

  if (!data) {
    return {
      profile: null,
      error: "등록된 프로필이 없습니다. 관리자에게 문의하십시오.",
    };
  }

  if (!isUserRole(data.role)) {
    return {
      profile: null,
      error: "유효하지 않은 사용자 역할입니다. 관리자에게 문의하십시오.",
    };
  }

  const profile: Profile = {
    id: data.id,
    role: data.role,
    name: data.name,
    phone: data.phone,
    email: data.email,
    is_active: data.is_active,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };

  return { profile, error: null };
}
