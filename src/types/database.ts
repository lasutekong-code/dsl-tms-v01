import type {
  ClientAccessRow,
  Json,
  ProfileRow,
  VehicleAccessRow,
  VehicleCardRow,
} from "@/types/vehicle";

export type ClientRow = {
  id: string;
  client_name: string;
  business_no: string | null;
  main_phone: string | null;
  address: string | null;
  is_active: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type CenterRow = {
  id: string;
  client_id: string;
  center_name: string;
  address: string | null;
  phone: string | null;
  is_active: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ClientContactRow = {
  id: string;
  client_id: string;
  center_id: string | null;
  contact_name: string;
  phone: string | null;
  email: string | null;
  profile_id: string | null;
  is_active: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type DriverRow = {
  id: string;
  profile_id: string | null;
  driver_name: string;
  birth_date: string | null;
  phone: string | null;
  driver_license_no: string | null;
  cargo_license_no: string | null;
  is_active: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type OwnerRow = {
  id: string;
  profile_id: string | null;
  owner_name: string;
  owner_phone: string | null;
  business_no: string | null;
  business_start_date: string | null;
  business_closed_date: string | null;
  vat_filing_enabled: boolean | null;
  service_fee_send_method: string | null;
  is_active: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type VehicleRow = {
  id: string;
  vehicle_no: string;
  car_name: string | null;
  registration_date: string | null;
  model_year: number | null;
  vin: string | null;
  vehicle_model_type: string | null;
  tonnage: number | null;
  status: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type VehicleSpecRow = {
  id: string;
  vehicle_id: string;
  special_equipment: string | null;
  height_mm: number | null;
  length_mm: number | null;
  width_mm: number | null;
  max_load_kg: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type VehicleAssignmentRow = {
  id: string;
  vehicle_id: string;
  client_id: string;
  center_id: string;
  driver_id: string;
  owner_id: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type InsuranceRow = {
  id: string;
  vehicle_id: string;
  insurance_company: string | null;
  insurance_rate: number | null;
  renewal_date: string | null;
  memo: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type VehicleInspectionRow = {
  id: string;
  vehicle_id: string;
  inspection_date: string;
  inspection_type: string | null;
  result: string | null;
  memo: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ContractRow = {
  id: string;
  vehicle_id: string;
  owner_id: string;
  client_id: string;
  contract_type: string;
  contract_start_date: string;
  contract_end_date: string | null;
  status: string;
  memo: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type AddressRow = {
  id: string;
  target_table: string;
  target_id: string;
  address_type: string | null;
  zip_code: string | null;
  address1: string | null;
  address2: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type MemoRow = {
  id: string;
  target_table: string;
  target_id: string;
  memo_type: string | null;
  content: string;
  visibility: string | null;
  created_at: string | null;
  updated_at?: string | null;
};

export type VehiclePhotoRow = {
  id: string;
  vehicle_id: string;
  photo_type: string | null;
  bucket: string | null;
  storage_path: string;
  created_at?: string | null;
};

export type DriverPhotoRow = {
  id: string;
  driver_id: string;
  bucket: string | null;
  storage_path: string;
  created_at?: string | null;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow> & { id: string };
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      clients: {
        Row: ClientRow;
        Insert: Omit<ClientRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<ClientRow>;
        Relationships: [];
      };
      centers: {
        Row: CenterRow;
        Insert: Omit<CenterRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<CenterRow>;
        Relationships: [];
      };
      client_contacts: {
        Row: ClientContactRow;
        Insert: Omit<ClientContactRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<ClientContactRow>;
        Relationships: [];
      };
      drivers: {
        Row: DriverRow;
        Insert: Omit<DriverRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<DriverRow>;
        Relationships: [];
      };
      owners: {
        Row: OwnerRow;
        Insert: Omit<OwnerRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<OwnerRow>;
        Relationships: [];
      };
      vehicles: {
        Row: VehicleRow;
        Insert: Omit<VehicleRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<VehicleRow>;
        Relationships: [];
      };
      vehicle_specs: {
        Row: VehicleSpecRow;
        Insert: Omit<VehicleSpecRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<VehicleSpecRow>;
        Relationships: [];
      };
      vehicle_assignments: {
        Row: VehicleAssignmentRow;
        Insert: Omit<VehicleAssignmentRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<VehicleAssignmentRow>;
        Relationships: [];
      };
      insurances: {
        Row: InsuranceRow;
        Insert: Omit<InsuranceRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<InsuranceRow>;
        Relationships: [];
      };
      vehicle_inspections: {
        Row: VehicleInspectionRow;
        Insert: Omit<VehicleInspectionRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<VehicleInspectionRow>;
        Relationships: [];
      };
      contracts: {
        Row: ContractRow;
        Insert: Omit<ContractRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<ContractRow>;
        Relationships: [];
      };
      user_client_access: {
        Row: ClientAccessRow & { user_id: string; id?: string };
        Insert: never;
        Update: Partial<ClientAccessRow>;
        Relationships: [];
      };
      user_vehicle_access: {
        Row: VehicleAccessRow & { user_id: string; id?: string };
        Insert: never;
        Update: Partial<VehicleAccessRow>;
        Relationships: [];
      };
      vehicle_photos: {
        Row: VehiclePhotoRow;
        Insert: Omit<VehiclePhotoRow, "id" | "created_at"> & { id?: string; created_at?: string | null };
        Update: Partial<VehiclePhotoRow>;
        Relationships: [];
      };
      driver_photos: {
        Row: DriverPhotoRow;
        Insert: Omit<DriverPhotoRow, "id" | "created_at"> & { id?: string; created_at?: string | null };
        Update: Partial<DriverPhotoRow>;
        Relationships: [];
      };
      addresses: {
        Row: AddressRow;
        Insert: Omit<AddressRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<AddressRow>;
        Relationships: [];
      };
      memos: {
        Row: MemoRow;
        Insert: Omit<MemoRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<MemoRow>;
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          profile_id: string | null;
          user_id: string | null;
          vehicle_id: string | null;
          action: string;
          sensitive_fields: string[] | null;
          ip_address: string | null;
          user_agent: string | null;
          target_table: string | null;
          target_id: string | null;
          metadata: Json | null;
          created_at: string | null;
        };
        Insert: {
          profile_id?: string | null;
          user_id?: string | null;
          vehicle_id?: string | null;
          action: string;
          sensitive_fields?: string[] | null;
          ip_address?: string | null;
          user_agent?: string | null;
          target_table?: string | null;
          target_id?: string | null;
          metadata?: Json | null;
        };
        Update: never;
        Relationships: [];
      };
      search_logs: {
        Row: {
          id: string;
          user_id: string;
          query: string;
          created_at: string | null;
        };
        Insert: { user_id: string; query: string };
        Update: never;
        Relationships: [];
      };
    };
    Views: {
      vehicle_card_view: {
        Row: VehicleCardRow;
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
