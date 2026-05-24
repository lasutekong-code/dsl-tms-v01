import type {
  ClientAccessRow,
  Json,
  ProfileRow,
  VehicleAccessRow,
  VehicleCard,
} from "@/types/vehicle";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: never;
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      user_client_access: {
        Row: ClientAccessRow & { user_id: string };
        Insert: never;
        Update: Partial<ClientAccessRow>;
        Relationships: [];
      };
      user_vehicle_access: {
        Row: VehicleAccessRow & { user_id: string };
        Insert: never;
        Update: Partial<VehicleAccessRow>;
        Relationships: [];
      };
      search_logs: {
        Row: {
          id: string;
          user_id: string;
          query: string;
          resource: string;
          role: string | null;
          result_count: number;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          query: string;
          resource: string;
          role: string | null;
          result_count: number;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
    };
    Views: {
      vehicle_card_view: {
        Row: VehicleCard;
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
