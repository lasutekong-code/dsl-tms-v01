import { redirect } from "next/navigation";

import { AdminForbidden } from "@/components/admin/admin-forbidden";
import { AdminLayoutClient } from "@/components/admin/admin-layout-client";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { mapProfileRow } from "@/lib/auth/map-profile-row";

export const dynamic = "force-dynamic";

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
    .select("id, role, is_active, name, email")
    .eq("id", admin.userId)
    .maybeSingle();

  const profile = profileRow ? mapProfileRow(profileRow) : null;

  if (!profile) {
    return <AdminForbidden />;
  }

  return <AdminLayoutClient profile={profile}>{children}</AdminLayoutClient>;
}
