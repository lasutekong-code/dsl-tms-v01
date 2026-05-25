import { redirect } from "next/navigation";

import {
  getProfileByUserId,
  getRedirectPathForRole,
} from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { profile } = await getProfileByUserId(supabase, user.id);

  if (!profile?.is_active) {
    redirect("/login");
  }

  redirect(getRedirectPathForRole(profile.role));
}
