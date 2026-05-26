import { canViewDriverPii } from "@/lib/auth/roles";
import type {
  DriversPiiFields,
  DriversPublicFields,
  DriversRow,
  DriversSafeView,
  UserRole,
} from "@/types/database";

export function toPublicDriverFields(
  driver: DriversRow
): DriversPublicFields {
  return {
    id: driver.id,
    user_id: driver.user_id,
    full_name: driver.full_name,
    phone: driver.phone,
    photo_path: driver.photo_path,
    is_active: driver.is_active,
    created_at: driver.created_at,
    updated_at: driver.updated_at,
  };
}

export function applyDriverPiiPolicy(
  driver: DriversRow,
  role: UserRole | null | undefined,
  photoSignedUrl?: string | null
): DriversSafeView {
  const base = toPublicDriverFields(driver);
  const view: DriversSafeView = {
    ...base,
    photo_signed_url: photoSignedUrl ?? null,
  };

  if (!canViewDriverPii(role)) {
    return view;
  }

  const pii: DriversPiiFields = {
    driver_license_number: driver.driver_license_number,
    birth_date: driver.birth_date,
    address: driver.address,
  };

  return { ...view, ...pii };
}
