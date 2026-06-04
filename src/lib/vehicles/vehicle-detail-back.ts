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

export function vehicleDetailHref(vehicleId: string, returnTo?: string) {
  if (!returnTo?.trim()) {
    return `/vehicles/${vehicleId}`;
  }

  return `/vehicles/${vehicleId}?from=${encodeURIComponent(returnTo.trim())}`;
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
