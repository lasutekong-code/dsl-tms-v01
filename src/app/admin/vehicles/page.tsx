export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth/get-profile";
import { AppHeader } from "@/components/layout/app-header";

export default async function AdminVehiclesPage() {
  const profile = await getProfile();

  if (!profile) redirect("/login");
  if (!profile.is_active) redirect("/login?error=inactive");
  if (profile.role !== "admin") redirect("/search");

  return (
    <div className="min-h-dvh bg-[#fafafa]">
      <AppHeader profile={profile} title="차량 관리" />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <p className="text-sm text-[#525252]">
          관리자용 차량 관리 화면입니다. (추후 구현)
        </p>
      </main>
    </div>
  );
}
