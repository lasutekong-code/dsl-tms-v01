import type { SupabaseClient } from "@supabase/supabase-js";

import { decryptAddressRow } from "@/lib/admin/pii-transform";
import { formatAddress } from "@/lib/vehicles/format";
import { DRIVER_PHOTO_BUCKET, VEHICLE_PHOTO_BUCKET } from "@/lib/vehicles/photo-url";
import type { Database } from "@/types/database";
import type {
  DriverPhoto,
  MemoVisibility,
  VehicleCardRow,
  VehicleDetail,
  VehicleMemo,
  VehiclePhoto,
  VehiclePhotoType,
} from "@/types/vehicle";

const PHOTO_ORDER: VehiclePhotoType[] = ["front", "rear", "side"];

type VehicleCardViewRow = VehicleCardRow & Record<string, unknown>;

function pickString(row: VehicleCardViewRow, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }

  return null;
}

function pickNumber(row: VehicleCardViewRow, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "number") {
      return value;
    }
    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

function pickBoolean(row: VehicleCardViewRow, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "boolean") {
      return value;
    }
  }

  return null;
}

export async function buildVehicleDetailFromView(
  supabase: SupabaseClient<Database>,
  row: VehicleCardViewRow,
): Promise<VehicleDetail> {
  const vehicleId = String(row.vehicle_id);
  const driverId = row.driver_id ? String(row.driver_id) : null;
  const ownerId = pickString(row, ["owner_id"]);

  const [photosResult, driverPhotoResult, driverAddressesResult, ownerAddressesResult, vehicleMemosResult, driverMemosResult, contractsResult] =
    await Promise.all([
    supabase
      .from("vehicle_photos")
      .select("id, photo_type, storage_path")
      .eq("vehicle_id", vehicleId)
      .in("photo_type", PHOTO_ORDER),
    driverId
      ? supabase
          .from("driver_photos")
          .select("id, storage_path")
          .eq("driver_id", driverId)
          .limit(1)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    driverId
      ? supabase
          .from("addresses")
          .select("address_type, zip_code, address1, address2")
          .eq("driver_id", driverId)
      : Promise.resolve({ data: [], error: null }),
    ownerId
      ? supabase
          .from("addresses")
          .select("address_type, zip_code, address1, address2")
          .eq("owner_id", ownerId)
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from("memos")
      .select("id, memo_type, content, visibility, created_at")
      .eq("vehicle_id", vehicleId),
    driverId
      ? supabase
          .from("memos")
          .select("id, memo_type, content, visibility, created_at")
          .eq("driver_id", driverId)
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from("contracts")
      .select("contract_type, contract_start_date, contract_end_date, status")
      .eq("vehicle_id", vehicleId)
      .order("contract_start_date", { ascending: false }),
  ]);

  const photoMap = new Map<string, VehiclePhoto>();

  for (const photo of photosResult.data ?? []) {
    if (photo.photo_type && PHOTO_ORDER.includes(photo.photo_type as VehiclePhotoType)) {
      photoMap.set(photo.photo_type, {
        id: photo.id,
        photo_type: photo.photo_type as VehiclePhotoType,
        storage_path: photo.storage_path,
        signed_url: null,
        bucket: VEHICLE_PHOTO_BUCKET,
      } as VehiclePhoto & { bucket?: string | null });
    }
  }

  const vehicle_photos = PHOTO_ORDER.map(
    (type) =>
      photoMap.get(type) ?? {
        id: `${vehicleId}-${type}`,
        photo_type: type,
        storage_path: null,
        signed_url: null,
      },
  );

  const addresses = [...(driverAddressesResult.data ?? []), ...(ownerAddressesResult.data ?? [])].map((item) =>
    decryptAddressRow({
      id: "",
      address_type: item.address_type,
      zip_code: item.zip_code,
      address1: item.address1,
      address2: item.address2,
    }),
  );
  const home = addresses.find((item) => item.address_type === "home");
  const mailing = addresses.find((item) => item.address_type === "mailing");

  const memoById = new Map<string, VehicleMemo>();
  for (const memo of [...(vehicleMemosResult.data ?? []), ...(driverMemosResult.data ?? [])]) {
    memoById.set(memo.id, {
      id: memo.id,
      memo_type: memo.memo_type,
      content: memo.content,
      visibility: (memo.visibility ?? "shared") as MemoVisibility,
      created_at: memo.created_at,
    });
  }

  const memos = [...memoById.values()].sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bTime - aTime;
  });

  const contractByType = new Map<string, { contract_start_date: string; contract_end_date: string | null }>();
  for (const contract of contractsResult.data ?? []) {
    if (!contractByType.has(contract.contract_type)) {
      contractByType.set(contract.contract_type, {
        contract_start_date: contract.contract_start_date,
        contract_end_date: contract.contract_end_date,
      });
    }
  }

  const consignment = contractByType.get("consignment");
  const vehicleService = contractByType.get("vehicle_service");
  const shipperCargo = contractByType.get("shipper_cargo");

  return {
    vehicle_id: vehicleId,
    vehicle_no: pickString(row, ["vehicle_no", "plate_number"]),
    car_name: pickString(row, ["car_name", "vehicle_name", "model_name"]),
    registration_date: pickString(row, ["registration_date"]),
    tonnage: pickNumber(row, ["tonnage", "ton"]),
    model_year: pickNumber(row, ["model_year", "year"]),
    vin: pickString(row, ["vin", "chassis_no"]),
    vehicle_model_type: pickString(row, ["vehicle_model_type", "vehicle_type"]),
    status: pickString(row, ["status"]),
    special_equipment: pickString(row, ["special_equipment", "special_body_status"]),
    height_mm: pickNumber(row, ["height_mm"]),
    length_mm: pickNumber(row, ["length_mm"]),
    width_mm: pickNumber(row, ["width_mm"]),
    max_load_kg: pickNumber(row, ["max_load_kg", "payload_kg"]),
    driver_id: row.driver_id ? String(row.driver_id) : null,
    driver_name: pickString(row, ["driver_name"]),
    birth_date: pickString(row, ["birth_date", "driver_birth_date"]),
    driver_phone: pickString(row, ["driver_phone"]),
    driver_license_no: pickString(row, ["driver_license_no", "license_number"]),
    cargo_license_no: pickString(row, ["cargo_license_no"]),
    owner_id: pickString(row, ["owner_id"]),
    owner_name: pickString(row, ["owner_name"]),
    owner_phone: pickString(row, ["owner_phone"]),
    owner_business_no: pickString(row, ["owner_business_no", "business_no"]),
    business_start_date: pickString(row, ["business_start_date", "business_registration_date"]),
    business_closed_date: pickString(row, ["business_closed_date"]),
    vat_filing_enabled: pickBoolean(row, ["vat_filing_enabled"]),
    service_fee_send_method: pickString(row, ["service_fee_send_method"]),
    client_id: row.client_id ? String(row.client_id) : null,
    client_name: pickString(row, ["client_name"]),
    center_id: row.center_id ? String(row.center_id) : null,
    center_name: pickString(row, ["center_name"]),
    contact_name: pickString(row, ["contact_name"]),
    contact_phone: pickString(row, ["contact_phone"]),
    insurance_company: pickString(row, ["insurance_company"]),
    insurance_rate: pickNumber(row, ["insurance_rate"]),
    insurance_renewal_date: pickString(row, ["insurance_renewal_date"]),
    latest_inspection_date: pickString(row, ["latest_inspection_date"]),
    inspection_result: pickString(row, ["inspection_result"]),
    inspection_memo: pickString(row, ["inspection_memo"]),
    consignment_contract_date:
      consignment?.contract_start_date ?? pickString(row, ["consignment_contract_date"]),
    consignment_contract_end_date:
      consignment?.contract_end_date ?? pickString(row, ["consignment_contract_end_date"]),
    service_contract_date: vehicleService?.contract_start_date ?? pickString(row, ["service_contract_date"]),
    service_contract_end_date:
      vehicleService?.contract_end_date ?? pickString(row, ["service_contract_end_date"]),
    shipper_cargo_contract_date:
      shipperCargo?.contract_start_date ?? pickString(row, ["shipper_cargo_contract_date"]),
    shipper_cargo_contract_end_date:
      shipperCargo?.contract_end_date ?? pickString(row, ["shipper_cargo_contract_end_date"]),
    home_address:
      pickString(row, ["home_address"]) ??
      (home ? formatAddress(home) : null),
    mailing_address:
      pickString(row, ["mailing_address"]) ??
      (mailing ? formatAddress(mailing) : null),
    vehicle_photos,
    driver_photo: driverPhotoResult.data
      ? ({
          id: driverPhotoResult.data.id,
          storage_path: driverPhotoResult.data.storage_path,
          signed_url: null,
          bucket: DRIVER_PHOTO_BUCKET,
        } as DriverPhoto & { bucket?: string | null })
      : null,
    memos,
    can_view_sensitive: false,
  };
}

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
