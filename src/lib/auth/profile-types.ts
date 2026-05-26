import type { Database, UserRole } from "@/types/database";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export const roleLabels: Record<UserRole, string> = {
  admin: "관리자",
  client_manager: "거래처 담당자",
  client_contact: "거래처 담당자",
  owner: "사업주",
  driver: "운전자",
  staff: "직원",
};

export function getRoleHomePath(role: UserRole) {
  if (role === "admin") {
    return "/admin/vehicles";
  }

  return "/search";
}
