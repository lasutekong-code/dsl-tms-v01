import { redirect } from "next/navigation";
import type { PropsWithChildren } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { requireProfile } from "@/lib/auth/get-profile";

export async function AdminPage({ children }: PropsWithChildren) {
  const profile = await requireProfile();

  if (profile.role !== "admin") {
    redirect("/dashboard");
  }

  return <AppShell profile={profile}>{children}</AppShell>;
}
