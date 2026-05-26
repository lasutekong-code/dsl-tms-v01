export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth/get-profile";
import { getRedirectPathForRole } from "@/lib/auth/role-redirect";

export default async function HomePage() {
  const profile = await getProfile();

  if (!profile) {
    redirect("/login");
  }

  if (!profile.is_active) {
    redirect("/login?error=inactive");
  }

  redirect(getRedirectPathForRole(profile.role));
}
