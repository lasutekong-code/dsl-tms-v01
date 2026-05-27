import type { Profile } from "@/lib/auth/profile-display";

/** DB column is `name`; app types use `full_name`. */
export function mapProfileRow(row: {
  id: string;
  role: string | null;
  is_active: boolean | null;
  name: string | null;
  email: string | null;
  phone?: string | null;
}): Profile {
  return {
    id: row.id,
    role: row.role,
    is_active: row.is_active,
    full_name: row.name,
    email: row.email,
  };
}
