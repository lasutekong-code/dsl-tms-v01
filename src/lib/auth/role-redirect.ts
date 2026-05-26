import type { ProfileRole } from "@/types/database";

export function getRedirectPathForRole(role: ProfileRole): string {
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

export function isProfileRole(value: string): value is ProfileRole {
  return (
    value === "admin" ||
    value === "client_manager" ||
    value === "owner" ||
    value === "driver" ||
    value === "staff"
  );
}
