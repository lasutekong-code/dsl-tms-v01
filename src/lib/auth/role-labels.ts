import type { UserRole } from "@/lib/auth/get-profile";

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "관리자",
  client_manager: "거래처담당자",
  owner: "사업주",
  driver: "운전자",
  staff: "내부직원",
};

export const LOGIN_ROLE_OPTIONS: UserRole[] = [
  "admin",
  "client_manager",
  "owner",
  "driver",
  "staff",
];
