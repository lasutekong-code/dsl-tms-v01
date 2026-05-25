export type UserRole =
  | "admin"
  | "manager"
  | "dispatcher"
  | "driver"
  | "viewer";

export type UsersRow = {
  id: number;
  auth_user_id: string | null;
  email: string;
  full_name: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  updated_by: number | null;
  deleted_at: string | null;
  deleted_by: number | null;
};

export type DriversRow = {
  id: string;
  user_id: number | null;
  full_name: string;
  phone: string | null;
  driver_license_number: string | null;
  birth_date: string | null;
  address: string | null;
  photo_path: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  updated_by: number | null;
  deleted_at: string | null;
  deleted_by: number | null;
};

/** Driver fields safe to expose in lists and low-privilege views */
export type DriversPublicFields = Pick<
  DriversRow,
  | "id"
  | "user_id"
  | "full_name"
  | "phone"
  | "photo_path"
  | "is_active"
  | "created_at"
  | "updated_at"
>;

/** PII fields gated by role */
export type DriversPiiFields = Pick<
  DriversRow,
  "driver_license_number" | "birth_date" | "address"
>;

export type DriversSafeView = DriversPublicFields &
  Partial<DriversPiiFields> & {
    photo_signed_url?: string | null;
  };

type TableDef<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      users: TableDef<UsersRow>;
      drivers: TableDef<DriversRow>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
    };
    CompositeTypes: Record<string, never>;
  };
};
