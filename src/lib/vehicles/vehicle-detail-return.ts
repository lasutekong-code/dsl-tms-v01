const STORAGE_KEY = "vehicle-detail-return-to";

const LIST_RETURN_PATHS = new Set([
  "/search",
  "/admin/drivers",
  "/admin/owners",
  "/admin/vehicles",
  "/admin/assignments",
  "/admin/insurances",
  "/admin/inspections",
  "/admin/contracts",
]);

export function isAllowedVehicleDetailReturnPath(pathname: string) {
  return LIST_RETURN_PATHS.has(pathname);
}

export function buildReturnToFromLocation(pathname: string, search: string) {
  if (!isAllowedVehicleDetailReturnPath(pathname)) {
    return null;
  }

  return search ? `${pathname}?${search}` : pathname;
}

export function setVehicleDetailReturnTo(returnTo: string) {
  if (typeof window === "undefined") {
    return;
  }

  const pathname = returnTo.split("?")[0] ?? returnTo;
  if (!isAllowedVehicleDetailReturnPath(pathname)) {
    return;
  }

  sessionStorage.setItem(STORAGE_KEY, returnTo);
}

export function getVehicleDetailReturnTo(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return null;
  }

  const pathname = stored.split("?")[0] ?? stored;
  if (!isAllowedVehicleDetailReturnPath(pathname)) {
    return null;
  }

  return stored;
}

export function resolveVehicleDetailBackHref(from: string | null | undefined): string {
  if (!from?.trim()) {
    return "/search";
  }

  let path = from.trim();
  try {
    path = decodeURIComponent(path);
  } catch {
    return "/search";
  }

  if (!path.startsWith("/") || path.startsWith("//")) {
    return "/search";
  }

  const pathname = path.split("?")[0] ?? path;
  if (!LIST_RETURN_PATHS.has(pathname)) {
    return "/search";
  }

  return path;
}

export function vehicleDetailHref(vehicleId: string, returnTo?: string) {
  if (!returnTo?.trim()) {
    return `/vehicles/${vehicleId}`;
  }

  return `/vehicles/${vehicleId}?from=${encodeURIComponent(returnTo.trim())}`;
}
