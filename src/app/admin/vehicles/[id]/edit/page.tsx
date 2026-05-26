import { notFound } from "next/navigation";

import { VehicleForm } from "@/components/forms/vehicle-form";
import { VehicleSpecForm } from "@/components/forms/vehicle-spec-form";
import { createClient } from "@/lib/supabase/server";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminVehicleEditPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: vehicle }, { data: spec }] = await Promise.all([
    supabase.from("vehicles").select("*").eq("id", id).maybeSingle(),
    supabase.from("vehicle_specs").select("*").eq("vehicle_id", id).maybeSingle(),
  ]);

  if (!vehicle) {
    notFound();
  }

  return (
    <div className="space-y-10">
      <VehicleForm mode="edit" defaultValues={vehicle} />
      <VehicleSpecForm vehicleId={id} defaultValues={spec} />
    </div>
  );
}
