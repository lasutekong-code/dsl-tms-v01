import type { UserRole } from "@/types/vehicle";

/** Client-safe profile shape for layouts and UI (no server imports). */
export type Profile = {
  id: string;
  role: UserRole | string | null;
  is_active: boolean | null;
  full_name: string | null;
  email: string | null;
};

export const roleLabels: Record<UserRole, string> = {
  admin: "관리자",
  client_manager: "거래처 담당",
  owner: "사업주",
  driver: "운전자",
  staff: "직원",
};
