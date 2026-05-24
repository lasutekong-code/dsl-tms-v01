import { notFound, redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { canViewVehicle } from "@/lib/permissions/can-view-vehicle";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/get-profile";

type VehiclePageProps = {
  params: Promise<{ id: string }>;
};

export default async function VehiclePage({ params }: VehiclePageProps) {
  const { id } = await params;
  const profile = await requireProfile();

  if (!(await canViewVehicle(profile, id))) {
    redirect("/dashboard");
  }

  const supabase = await createClient();
  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("id, plate_number, vehicle_number, vehicle_type, status")
    .eq("id", id)
    .single();

  if (!vehicle) {
    notFound();
  }

  return (
    <AppShell profile={profile}>
      <Card className="stack">
        <div>
          <p style={{ color: "var(--muted)", margin: 0 }}>차량 상세</p>
          <h1 style={{ fontSize: 32, margin: "8px 0" }}>{vehicle.plate_number}</h1>
        </div>
        <dl style={{ display: "grid", gap: 12, gridTemplateColumns: "160px 1fr", margin: 0 }}>
          <dt style={{ color: "var(--muted)" }}>차량번호</dt>
          <dd style={{ margin: 0 }}>{vehicle.vehicle_number ?? "-"}</dd>
          <dt style={{ color: "var(--muted)" }}>차종</dt>
          <dd style={{ margin: 0 }}>{vehicle.vehicle_type ?? "-"}</dd>
          <dt style={{ color: "var(--muted)" }}>상태</dt>
          <dd style={{ margin: 0 }}>{vehicle.status ?? "-"}</dd>
        </dl>
      </Card>
    </AppShell>
  );
}
