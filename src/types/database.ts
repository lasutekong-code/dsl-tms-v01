/** public.profiles — Supabase 스키마 기준 (추측 없음) */
export type ProfileRole =
  | "admin"
  | "client_manager"
  | "owner"
  | "driver"
  | "staff";

export type ProfileRow = {
  id: string;
  role: ProfileRole;
  name: string | null;
  phone: string | null;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export const PROFILE_COLUMNS =
  "id, role, name, phone, email, is_active, created_at, updated_at" as const;

type TableDef<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: TableDef<ProfileRow>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
