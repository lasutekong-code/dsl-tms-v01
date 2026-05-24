export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole =
  | "admin"
  | "client_manager"
  | "owner"
  | "driver"
  | "staff";

export type VehicleCard = {
  vehicle_id: string;
  client_id: string | null;
  client_name: string | null;
  vehicle_no: string | null;
  driver_name: string | null;
  can_view_sensitive?: boolean | null;
  [key: string]: Json | undefined;
};

export type ProfileRow = {
  id: string;
  role: UserRole | string | null;
};

export type ClientAccessRow = {
  client_id: string;
  can_view_sensitive: boolean | null;
};

export type VehicleAccessRow = {
  vehicle_id: string;
  can_view_sensitive: boolean | null;
};
