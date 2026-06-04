import { redirect } from "next/navigation";

import { getProfile, getRoleHomePath } from "@/lib/auth/get-profile";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  if (!isSupabaseConfigured()) {
    redirect("/login?error=config");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getProfile(user.id);
  if (!profile?.is_active || !profile.role) {
    redirect("/login");
  }

  redirect(getRoleHomePath(profile.role));
}
