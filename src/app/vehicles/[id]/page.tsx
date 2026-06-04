import { VehicleDetailPage } from "@/components/vehicle/vehicle-detail-page";
import { AppShell } from "@/components/layout/app-shell";
import { requireProfile } from "@/lib/auth/get-profile";

import { resolveVehicleDetailBackHref } from "@/lib/vehicles/vehicle-detail-back";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ from?: string }>;
};

export default async function Page({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const backHref = resolveVehicleDetailBackHref(sp?.from);
  const profile = await requireProfile();

  if (profile.is_active === false) {
    return (
      <AppShell profile={profile}>
        <VehicleDetailPage vehicleId={id} backHref={backHref} />
      </AppShell>
    );
  }

  return (
    <AppShell profile={profile}>
      <VehicleDetailPage vehicleId={id} backHref={backHref} />
    </AppShell>
  );
}
