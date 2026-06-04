import { Suspense } from "react";

import { VehicleDetailPage } from "@/components/vehicle/vehicle-detail-page";
import { AppShell } from "@/components/layout/app-shell";
import { requireProfile } from "@/lib/auth/get-profile";
import { resolveVehicleDetailBackHref } from "@/lib/vehicles/vehicle-detail-return";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ from?: string }>;
};

export default async function Page({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const backHref = resolveVehicleDetailBackHref(sp?.from);
  const profile = await requireProfile();

  const detail = (
    <Suspense fallback={<div className="px-4 py-6 text-sm text-slate-500">차량 정보를 불러오는 중…</div>}>
      <VehicleDetailPage vehicleId={id} backHref={backHref} />
    </Suspense>
  );

  if (profile.is_active === false) {
    return <AppShell profile={profile}>{detail}</AppShell>;
  }

  return <AppShell profile={profile}>{detail}</AppShell>;
}
