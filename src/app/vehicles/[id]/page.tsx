import { VehicleDetailPage } from "@/components/vehicle/vehicle-detail-page";
import { AppShell } from "@/components/layout/app-shell";
import { requireProfile } from "@/lib/auth/get-profile";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const profile = await requireProfile();

  if (profile.is_active === false) {
    return (
      <AppShell profile={profile}>
        <VehicleDetailPage vehicleId={id} />
      </AppShell>
    );
  }

  return (
    <AppShell profile={profile}>
      <VehicleDetailPage vehicleId={id} />
    </AppShell>
  );
}
