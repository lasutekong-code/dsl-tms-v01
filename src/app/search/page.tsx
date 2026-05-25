import { redirect } from "next/navigation";

import { AppHeader } from "@/components/layout/app-header";
import {
  getProfileByUserId,
  getRedirectPathForRole,
  type UserRole,
} from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";

const SEARCH_ROLES: UserRole[] = [
  "client_manager",
  "owner",
  "driver",
  "staff",
];

export default async function SearchPage() {
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

  if (!SEARCH_ROLES.includes(profile.role)) {
    redirect(getRedirectPathForRole(profile.role));
  }

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader profile={profile} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <h1 className="text-xl font-semibold">조회</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          차량 조회 화면입니다. (추후 구현)
        </p>
      </main>
    </div>
  );
}
