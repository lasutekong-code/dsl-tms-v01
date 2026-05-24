export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "admin" | "client_contact" | "owner" | "driver";

type Row<T> = T;
type Insert<T> = Partial<T>;
type Update<T> = Partial<T>;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Row<{
          id: string;
          email: string | null;
          full_name: string | null;
          role: UserRole;
          created_at: string | null;
          updated_at: string | null;
        }>;
        Insert: Insert<Database["public"]["Tables"]["profiles"]["Row"]>;
        Update: Update<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      clients: {
        Row: Row<{
          id: string;
          name: string;
          business_number: string | null;
          phone: string | null;
          created_at: string | null;
        }>;
        Insert: Insert<Database["public"]["Tables"]["clients"]["Row"]>;
        Update: Update<Database["public"]["Tables"]["clients"]["Row"]>;
        Relationships: [];
      };
      centers: {
        Row: Row<{
          id: string;
          client_id: string | null;
          name: string;
          phone: string | null;
          created_at: string | null;
        }>;
        Insert: Insert<Database["public"]["Tables"]["centers"]["Row"]>;
        Update: Update<Database["public"]["Tables"]["centers"]["Row"]>;
        Relationships: [];
      };
      client_contacts: {
        Row: Row<{
          id: string;
          client_id: string | null;
          profile_id: string | null;
          name: string;
          phone: string | null;
          email: string | null;
          created_at: string | null;
        }>;
        Insert: Insert<Database["public"]["Tables"]["client_contacts"]["Row"]>;
        Update: Update<Database["public"]["Tables"]["client_contacts"]["Row"]>;
        Relationships: [];
      };
      owners: {
        Row: Row<{
          id: string;
          profile_id: string | null;
          name: string;
          phone: string | null;
          business_number: string | null;
          created_at: string | null;
        }>;
        Insert: Insert<Database["public"]["Tables"]["owners"]["Row"]>;
        Update: Update<Database["public"]["Tables"]["owners"]["Row"]>;
        Relationships: [];
      };
      drivers: {
        Row: Row<{
          id: string;
          profile_id: string | null;
          name: string;
          phone: string | null;
          license_number: string | null;
          created_at: string | null;
        }>;
        Insert: Insert<Database["public"]["Tables"]["drivers"]["Row"]>;
        Update: Update<Database["public"]["Tables"]["drivers"]["Row"]>;
        Relationships: [];
      };
      vehicles: {
        Row: Row<{
          id: string;
          plate_number: string;
          vehicle_number: string | null;
          vehicle_type: string | null;
          status: string | null;
          created_at: string | null;
          updated_at: string | null;
        }>;
        Insert: Insert<Database["public"]["Tables"]["vehicles"]["Row"]>;
        Update: Update<Database["public"]["Tables"]["vehicles"]["Row"]>;
        Relationships: [];
      };
      vehicle_specs: {
        Row: Row<{
          id: string;
          vehicle_id: string;
          manufacturer: string | null;
          model: string | null;
          year: number | null;
          payload_kg: number | null;
          created_at: string | null;
        }>;
        Insert: Insert<Database["public"]["Tables"]["vehicle_specs"]["Row"]>;
        Update: Update<Database["public"]["Tables"]["vehicle_specs"]["Row"]>;
        Relationships: [];
      };
      vehicle_photos: {
        Row: Row<{
          id: string;
          vehicle_id: string;
          bucket: string | null;
          storage_path: string;
          sort_order: number | null;
          created_at: string | null;
        }>;
        Insert: Insert<Database["public"]["Tables"]["vehicle_photos"]["Row"]>;
        Update: Update<Database["public"]["Tables"]["vehicle_photos"]["Row"]>;
        Relationships: [];
      };
      driver_photos: {
        Row: Row<{
          id: string;
          driver_id: string;
          bucket: string | null;
          storage_path: string;
          created_at: string | null;
        }>;
        Insert: Insert<Database["public"]["Tables"]["driver_photos"]["Row"]>;
        Update: Update<Database["public"]["Tables"]["driver_photos"]["Row"]>;
        Relationships: [];
      };
      vehicle_assignments: {
        Row: Row<{
          id: string;
          vehicle_id: string;
          client_id: string | null;
          center_id: string | null;
          driver_id: string | null;
          owner_id: string | null;
          assigned_from: string | null;
          assigned_to: string | null;
          created_at: string | null;
        }>;
        Insert: Insert<Database["public"]["Tables"]["vehicle_assignments"]["Row"]>;
        Update: Update<Database["public"]["Tables"]["vehicle_assignments"]["Row"]>;
        Relationships: [];
      };
      insurances: {
        Row: Row<{ id: string; vehicle_id: string; provider: string | null; policy_number: string | null; starts_at: string | null; ends_at: string | null }>;
        Insert: Insert<Database["public"]["Tables"]["insurances"]["Row"]>;
        Update: Update<Database["public"]["Tables"]["insurances"]["Row"]>;
        Relationships: [];
      };
      vehicle_inspections: {
        Row: Row<{ id: string; vehicle_id: string; inspected_at: string | null; result: string | null; memo: string | null }>;
        Insert: Insert<Database["public"]["Tables"]["vehicle_inspections"]["Row"]>;
        Update: Update<Database["public"]["Tables"]["vehicle_inspections"]["Row"]>;
        Relationships: [];
      };
      contracts: {
        Row: Row<{ id: string; vehicle_id: string | null; owner_id: string | null; client_id: string | null; contract_type: string | null; starts_at: string | null; ends_at: string | null }>;
        Insert: Insert<Database["public"]["Tables"]["contracts"]["Row"]>;
        Update: Update<Database["public"]["Tables"]["contracts"]["Row"]>;
        Relationships: [];
      };
      addresses: {
        Row: Row<{ id: string; target_table: string; target_id: string; address_line1: string; address_line2: string | null; postal_code: string | null }>;
        Insert: Insert<Database["public"]["Tables"]["addresses"]["Row"]>;
        Update: Update<Database["public"]["Tables"]["addresses"]["Row"]>;
        Relationships: [];
      };
      memos: {
        Row: Row<{ id: string; target_table: string; target_id: string; body: string; created_by: string | null; created_at: string | null }>;
        Insert: Insert<Database["public"]["Tables"]["memos"]["Row"]>;
        Update: Update<Database["public"]["Tables"]["memos"]["Row"]>;
        Relationships: [];
      };
      user_client_access: {
        Row: Row<{ id: string; user_id: string; client_id: string; created_at: string | null }>;
        Insert: Insert<Database["public"]["Tables"]["user_client_access"]["Row"]>;
        Update: Update<Database["public"]["Tables"]["user_client_access"]["Row"]>;
        Relationships: [];
      };
      user_vehicle_access: {
        Row: Row<{ id: string; user_id: string; vehicle_id: string; created_at: string | null }>;
        Insert: Insert<Database["public"]["Tables"]["user_vehicle_access"]["Row"]>;
        Update: Update<Database["public"]["Tables"]["user_vehicle_access"]["Row"]>;
        Relationships: [];
      };
      search_logs: {
        Row: Row<{ id: string; user_id: string | null; query: string; created_at: string | null }>;
        Insert: Insert<Database["public"]["Tables"]["search_logs"]["Row"]>;
        Update: Update<Database["public"]["Tables"]["search_logs"]["Row"]>;
        Relationships: [];
      };
      audit_logs: {
        Row: Row<{ id: string; user_id: string | null; action: string; target_table: string | null; target_id: string | null; metadata: Json | null; created_at: string | null }>;
        Insert: Insert<Database["public"]["Tables"]["audit_logs"]["Row"]>;
        Update: Update<Database["public"]["Tables"]["audit_logs"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
    };
    CompositeTypes: Record<string, never>;
  };
};
