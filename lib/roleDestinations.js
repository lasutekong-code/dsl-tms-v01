export const ROLE_DESTINATIONS = {
  admin: "/admin/vehicles",
  client_manager: "/search",
  owner: "/search",
  driver: "/search",
  staff: "/search",
};

export const SEARCH_ROLES = ["client_manager", "owner", "driver", "staff"];

export function getRoleDestination(role) {
  return ROLE_DESTINATIONS[role] || null;
}
