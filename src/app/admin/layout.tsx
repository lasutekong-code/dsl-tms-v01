import { redirect } from "next/navigation";

import { AdminForbidden } from "@/components/admin/admin-forbidden";
import { AdminLayoutClient } from "@/components/admin/admin-layout-client";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/auth/profile-display";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const admin = await requireAdmin();

  if (!admin.ok && admin.reason === "unauthenticated") {
    redirect("/login?next=%2Fadmin");
  }

  if (!admin.ok) {
    return <AdminForbidden />;
  }

  const supabase = await createClient();
  const { data: profileRow } = await supabase
    .from("profiles")
    .select("id, role, is_active, full_name, email")
    .eq("id", admin.userId)
    .maybeSingle();

  const profile = profileRow as Profile | null;

  if (!profile) {
    return <AdminForbidden />;
  }

  return <AdminLayoutClient profile={profile}>{children}</AdminLayoutClient>;
}
