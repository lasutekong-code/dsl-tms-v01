import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import {
  getProfileByUserId,
  getRedirectPathForRole,
} from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { profile } = await getProfileByUserId(supabase, user.id);
    if (profile?.is_active) {
      redirect(getRedirectPathForRole(profile.role));
    }
  }

  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-slate-100 px-4 py-10 sm:px-6 sm:py-12">
      <LoginForm />
    </main>
  );
}
