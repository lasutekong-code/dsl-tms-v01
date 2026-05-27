import type { UserRole } from "@/types/vehicle";
import {
  Briefcase,
  Building2,
  Shield,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";

export type LoginRoleOption = {
  value: UserRole;
  label: string;
  /** Figma selected / default inactive */
  activeClass: string;
  inactiveClass: string;
  Icon: LucideIcon;
};

export const LOGIN_ROLE_OPTIONS: LoginRoleOption[] = [
  {
    value: "admin",
    label: "관리자",
    activeClass: "bg-[#673ab7] text-white shadow-sm",
    inactiveClass: "bg-neutral-300 text-white hover:bg-neutral-400",
    Icon: Shield,
  },
  {
    value: "client_manager",
    label: "거래처담당자",
    activeClass: "bg-[#2196f3] text-white shadow-sm",
    inactiveClass: "bg-neutral-300 text-white hover:bg-neutral-400",
    Icon: Building2,
  },
  {
    value: "owner",
    label: "사업주",
    activeClass: "bg-[#4caf50] text-white shadow-sm",
    inactiveClass: "bg-neutral-300 text-white hover:bg-neutral-400",
    Icon: Briefcase,
  },
  {
    value: "driver",
    label: "운전자",
    activeClass: "bg-[#ff9800] text-white shadow-sm",
    inactiveClass: "bg-neutral-300 text-white hover:bg-neutral-400",
    Icon: Truck,
  },
  {
    value: "staff",
    label: "직원",
    activeClass: "bg-[#607d8b] text-white shadow-sm",
    inactiveClass: "bg-neutral-300 text-white hover:bg-neutral-400",
    Icon: Users,
  },
];

export function isUserRole(value: string): value is UserRole {
  return LOGIN_ROLE_OPTIONS.some((r) => r.value === value);
}
