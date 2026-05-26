export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth/get-profile";
import { AppHeader } from "@/components/layout/app-header";

export default async function SearchPage() {
  const profile = await getProfile();

  if (!profile) redirect("/login");
  if (!profile.is_active) redirect("/login?error=inactive");

  return (
    <div className="min-h-dvh bg-[#fafafa]">
      <AppHeader profile={profile} title="차량 검색" />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <p className="text-sm text-[#525252]">
          {profile.name ?? profile.email}님, 차량 검색 화면입니다. (추후 구현)
        </p>
      </main>
    </div>
  );
}
