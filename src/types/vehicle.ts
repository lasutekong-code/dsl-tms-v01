export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "admin" | "client_manager" | "owner" | "driver" | "staff";

export type VehicleStatus = "active" | "inactive" | "suspended" | "terminated";

export type VehiclePhotoType = "front" | "rear" | "side";

export type MemoVisibility = "shared" | "internal" | "admin_only";

export type VehiclePhoto = {
  id: string;
  photo_type: VehiclePhotoType;
  storage_path: string | null;
  signed_url: string | null;
};

export type DriverPhoto = {
  id: string;
  storage_path: string | null;
  signed_url: string | null;
};

export type VehicleMemo = {
  id: string;
  memo_type: string | null;
  content: string;
  visibility: MemoVisibility;
  created_at: string | null;
};

export type AddressView = {
  address_type: string;
  zip_code: string | null;
  address1: string | null;
  address2: string | null;
};

export type VehicleDetail = {
  vehicle_id: string;
  vehicle_no: string | null;
  car_name: string | null;
  registration_date: string | null;
  tonnage: number | null;
  model_year: number | null;
  vin: string | null;
  vehicle_model_type: string | null;
  status: VehicleStatus | string | null;
  special_equipment: string | null;
  height_mm: number | null;
  length_mm: number | null;
  width_mm: number | null;
  max_load_kg: number | null;
  driver_id: string | null;
  driver_name: string | null;
  birth_date: string | null;
  driver_phone: string | null;
  driver_license_no: string | null;
  cargo_license_no: string | null;
  owner_id: string | null;
  owner_name: string | null;
  owner_phone: string | null;
  owner_business_no: string | null;
  business_start_date: string | null;
  business_closed_date: string | null;
  vat_filing_enabled: boolean | null;
  service_fee_send_method: string | null;
  client_id: string | null;
  client_name: string | null;
  center_id: string | null;
  center_name: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  insurance_company: string | null;
  insurance_rate: number | null;
  insurance_renewal_date: string | null;
  latest_inspection_date: string | null;
  inspection_result: string | null;
  inspection_memo: string | null;
  consignment_contract_date: string | null;
  consignment_contract_end_date: string | null;
  service_contract_date: string | null;
  service_contract_end_date: string | null;
  shipper_cargo_contract_date: string | null;
  shipper_cargo_contract_end_date: string | null;
  home_address: string | null;
  mailing_address: string | null;
  vehicle_photos: VehiclePhoto[];
  driver_photo: DriverPhoto | null;
  memos: VehicleMemo[];
  can_view_sensitive: boolean;
};

export type VehicleCardRow = {
  vehicle_id: string;
  client_id: string | null;
  client_name: string | null;
  center_id: string | null;
  center_name: string | null;
  vehicle_no: string | null;
  car_name: string | null;
  driver_id: string | null;
  driver_name: string | null;
  driver_phone: string | null;
  owner_name: string | null;
  status: string | null;
  tonnage: number | null;
  special_equipment: string | null;
  can_view_sensitive?: boolean | null;
  [key: string]: Json | undefined;
};

export type ProfileRow = {
  id: string;
  role: UserRole | string | null;
  is_active: boolean | null;
  name: string | null;
  phone?: string | null;
  email: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ClientAccessRow = {
  client_id: string;
  can_view_sensitive: boolean | null;
};

export type VehicleAccessRow = {
  vehicle_id: string;
  can_view_sensitive: boolean | null;
};
