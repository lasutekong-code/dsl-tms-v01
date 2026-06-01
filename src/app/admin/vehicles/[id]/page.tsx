import { notFound } from "next/navigation";

import { VehicleDetailView } from "@/components/admin/detail/entity-detail-views";
import { createClient } from "@/lib/supabase/server";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminVehicleViewPage({ params }: PageProps) {
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

  return <VehicleDetailView data={vehicle} spec={spec} photos={photos ?? []} />;
}
