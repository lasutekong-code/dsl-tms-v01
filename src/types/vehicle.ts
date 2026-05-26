export type UserRole = "admin" | "client_manager" | "owner" | "driver" | "staff";

export type VehicleSearchResult = {
  vehicle_id: string;
  vehicle_no: string | null;
  client_name: string | null;
  center_name: string | null;
  driver_name: string | null;
  driver_phone: string | null;
  car_name: string | null;
  tonnage: string | null;
  model_year: string | null;
  special_equipment: string | null;
  insurance_renewal_date: string | null;
  latest_inspection_date: string | null;
  status: string | null;
  can_view_sensitive: boolean;
};

/** Columns selected from `vehicle_card_view` for search. */
export type VehicleCardViewRow = VehicleSearchResult & {
  client_id: string | null;
};

export type ProfileRow = {
  id: string;
  role: UserRole | string | null;
  is_active: boolean | null;
};

export type ClientAccessRow = {
  client_id: string;
  can_view_sensitive: boolean | null;
};

export type VehicleAccessRow = {
  vehicle_id: string;
  can_view_sensitive: boolean | null;
};
