import { notFound } from "next/navigation";

import { DriverPhotoUploadForm } from "@/components/forms/driver-photo-upload-form";
import { decryptDriverRow } from "@/lib/admin/pii-transform";
import { createClient } from "@/lib/supabase/server";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminDriverPhotoPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: driver } = await supabase.from("drivers").select("id, driver_name").eq("id", id).maybeSingle();
  if (!driver) {
    notFound();
  }

  const { data: photo } = await supabase.from("driver_photos").select("storage_path").eq("driver_id", id).maybeSingle();
  const decrypted = decryptDriverRow(driver as Parameters<typeof decryptDriverRow>[0]);

  return (
    <DriverPhotoUploadForm
      driverId={id}
      driverName={decrypted.driver_name}
      existingPath={photo?.storage_path ?? null}
    />
  );
}
