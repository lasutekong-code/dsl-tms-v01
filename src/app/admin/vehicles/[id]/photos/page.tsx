import { notFound } from "next/navigation";

import { VehiclePhotoUploadForm } from "@/components/forms/vehicle-photo-upload-form";
import { createClient } from "@/lib/supabase/server";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminVehiclePhotosPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: vehicle } = await supabase.from("vehicles").select("id, vehicle_no").eq("id", id).maybeSingle();
  if (!vehicle) {
    notFound();
  }

  const { data: photos } = await supabase
    .from("vehicle_photos")
    .select("photo_type, storage_path")
    .eq("vehicle_id", id);

  return (
    <VehiclePhotoUploadForm
      vehicleId={id}
      vehicleNo={vehicle.vehicle_no}
      existing={photos ?? []}
    />
  );
}
