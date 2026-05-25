import type { UserRole } from "@/types/database";

const ROLE_RANK: Record<UserRole, number> = {
  admin: 100,
  manager: 80,
  dispatcher: 60,
  driver: 40,
  viewer: 20,
};

/** Roles that may view driver license, birth_date, and address */
const PII_VIEW_ROLES: UserRole[] = ["admin", "manager"];

/** Roles allowed past the login gate (active app users) */
const APP_ACCESS_ROLES: UserRole[] = [
  "admin",
  "manager",
  "dispatcher",
  "driver",
  "viewer",
];

export function canAccessApp(role: UserRole | null | undefined): boolean {
  return role != null && APP_ACCESS_ROLES.includes(role);
}

export function canViewDriverPii(role: UserRole | null | undefined): boolean {
  return role != null && PII_VIEW_ROLES.includes(role);
}

export function hasMinimumRole(
  role: UserRole | null | undefined,
  minimum: UserRole
): boolean {
  if (!role) return false;
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}

/** Route prefixes restricted by minimum role */
export const ROUTE_ROLE_REQUIREMENTS: Record<string, UserRole> = {
  "/admin": "admin",
  "/drivers/manage": "manager",
  "/dispatch": "dispatcher",
};

export function requiredRoleForPath(pathname: string): UserRole | null {
  const match = Object.entries(ROUTE_ROLE_REQUIREMENTS).find(([prefix]) =>
    pathname.startsWith(prefix)
  );
  return match ? match[1] : null;
}

export function canAccessPath(
  pathname: string,
  role: UserRole | null | undefined
): boolean {
  const required = requiredRoleForPath(pathname);
  if (!required) return canAccessApp(role);
  return hasMinimumRole(role, required);
}
