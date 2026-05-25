import { createClient } from "@/lib/supabase/server";
import type { UserRole, UsersRow } from "@/types/database";

export type AppSession = {
  authUserId: string;
  email: string;
  user: UsersRow;
  role: UserRole;
};

export async function getAppSession(): Promise<AppSession | null> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser?.email) return null;

  const { data: appUser, error } = await supabase
    .from("users")
    .select("*")
    .eq("auth_user_id", authUser.id)
    .is("deleted_at", null)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !appUser) return null;

  return {
    authUserId: authUser.id,
    email: authUser.email,
    user: appUser,
    role: appUser.role,
  };
}
