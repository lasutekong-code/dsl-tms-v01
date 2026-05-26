export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth/get-profile";
import { getRedirectPathForRole } from "@/lib/auth/role-redirect";

/**
 * 로그인 후 role에 따라 적절한 업무 화면으로 보냅니다.
 */
export default async function DashboardPage() {
  const profile = await getProfile();

  if (!profile) {
    redirect("/login");
  }

  if (!profile.is_active) {
    redirect("/login?error=inactive");
  }

  redirect(getRedirectPathForRole(profile.role));
}
