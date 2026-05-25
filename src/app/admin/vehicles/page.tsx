import { redirect } from "next/navigation";

import { AppHeader } from "@/components/layout/app-header";
import {
  getProfileByUserId,
  getRedirectPathForRole,
} from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";

export default async function AdminVehiclesPage() {
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

  if (profile.role !== "admin") {
    redirect(getRedirectPathForRole(profile.role));
  }

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader profile={profile} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <h1 className="text-xl font-semibold">차량 관리</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          관리자 차량 관리 화면입니다. (추후 구현)
        </p>
      </main>
    </div>
  );
}
