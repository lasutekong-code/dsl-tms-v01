import type {
  ClientAccessRow,
  Json,
  ProfileRow,
  VehicleAccessRow,
  VehicleCardRow,
} from "@/types/vehicle";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow>;
        Update: Partial<ProfileRow>;
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
        Row: {
          id: string;
          vehicle_id: string;
          photo_type: string | null;
          bucket: string | null;
          storage_path: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      driver_photos: {
        Row: {
          id: string;
          driver_id: string;
          bucket: string | null;
          storage_path: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      addresses: {
        Row: {
          id: string;
          target_table: string;
          target_id: string;
          address_type: string | null;
          zip_code: string | null;
          address1: string | null;
          address2: string | null;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      memos: {
        Row: {
          id: string;
          target_table: string;
          target_id: string;
          memo_type: string | null;
          content: string;
          visibility: string | null;
          created_at: string | null;
        };
        Insert: never;
        Update: never;
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
