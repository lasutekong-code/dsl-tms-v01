import { notFound } from "next/navigation";

import { VehiclePhotoUploadForm } from "@/components/forms/vehicle-photo-upload-form";
import { createClient } from "@/lib/supabase/server";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminVehiclePhotosPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: vehicle } = await supabase.from("vehicles").select("id").eq("id", id).maybeSingle();
  if (!vehicle) {
    notFound();
  }

  const { data: photos } = await supabase.from("vehicle_photos").select("photo_type, storage_path, bucket").eq("vehicle_id", id);

  return <VehiclePhotoUploadForm vehicleId={id} existing={photos ?? []} />;
}
