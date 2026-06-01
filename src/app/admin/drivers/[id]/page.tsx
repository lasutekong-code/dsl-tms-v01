import { notFound } from "next/navigation";

import { DriverDetailView } from "@/components/admin/detail/entity-detail-views";
import { decryptDriverRow } from "@/lib/admin/pii-transform";
import { createClient } from "@/lib/supabase/server";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminDriverViewPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: driver }, { data: photo }] = await Promise.all([
    supabase.from("drivers").select("*").eq("id", id).maybeSingle(),
    supabase.from("driver_photos").select("storage_path").eq("driver_id", id).maybeSingle(),
  ]);

  if (!driver) {
    notFound();
  }

  return <DriverDetailView data={decryptDriverRow(driver)} photoStoragePath={photo?.storage_path ?? null} />;
}
