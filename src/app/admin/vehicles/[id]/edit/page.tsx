import { notFound } from "next/navigation";

import { VehicleForm } from "@/components/forms/vehicle-form";
import { createClient } from "@/lib/supabase/server";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminVehicleEditPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: vehicle }, { data: spec }, { data: photos }] = await Promise.all([
    supabase.from("vehicles").select("*").eq("id", id).maybeSingle(),
    supabase.from("vehicle_specs").select("*").eq("vehicle_id", id).maybeSingle(),
    supabase.from("vehicle_photos").select("photo_type, storage_path").eq("vehicle_id", id),
  ]);

  if (!vehicle) {
    notFound();
  }

  return <VehicleForm mode="edit" defaultValues={vehicle} spec={spec} photos={photos ?? []} />;
}
