import { maskPhone } from "@/lib/utils/mask-sensitive";
import type { UserRole, VehicleDetail, VehicleMemo } from "@/types/vehicle";

const SENSITIVE_FIELDS = [
  "birth_date",
  "driver_license_no",
  "cargo_license_no",
  "vin",
  "owner_business_no",
  "insurance_rate",
  "home_address",
  "mailing_address",
] as const;

const PHONE_FIELDS = ["driver_phone", "owner_phone", "contact_phone"] as const;

export function filterMemosForRole(memos: VehicleMemo[], role: UserRole): VehicleMemo[] {
  if (role === "admin") {
    return memos;
  }

  return memos.filter((memo) => memo.visibility === "shared");
}

export function sanitizeVehicleDetail(
  detail: VehicleDetail,
  role: UserRole,
  canViewSensitive: boolean,
): { detail: VehicleDetail; sensitiveFields: string[] } {
  const sensitiveFields: string[] = [];
  const effectiveSensitive = canViewSensitive && role !== "client_manager";

  const next: VehicleDetail = {
    ...detail,
    memos: filterMemosForRole(detail.memos, role),
    can_view_sensitive: effectiveSensitive,
  };

  if (!effectiveSensitive) {
    for (const field of SENSITIVE_FIELDS) {
      if (detail[field] != null) {
        sensitiveFields.push(field);
      }
      (next as Record<string, unknown>)[field] = null;
    }
  }

  if (!effectiveSensitive) {
    for (const field of PHONE_FIELDS) {
      const current = next[field];
      if (current) {
        sensitiveFields.push(field);
        (next as Record<string, unknown>)[field] = maskPhone(current);
      }
    }
  }

  next.vehicle_photos = detail.vehicle_photos.map((photo) => ({
    ...photo,
    storage_path: null,
  }));

  if (next.driver_photo) {
    next.driver_photo = {
      ...next.driver_photo,
      storage_path: null,
    };
  }

  return { detail: next, sensitiveFields };
}

export function collectViewedSensitiveFields(
  detail: VehicleDetail,
  role: UserRole,
): string[] {
  if (role !== "admin" && role !== "client_manager") {
    return [];
  }

  const fields: string[] = [];

  for (const field of SENSITIVE_FIELDS) {
    if (detail[field] != null) {
      fields.push(field);
    }
  }

  for (const memo of detail.memos) {
    if (memo.visibility !== "shared") {
      fields.push(`memo:${memo.visibility}`);
    }
  }

  return fields;
}
