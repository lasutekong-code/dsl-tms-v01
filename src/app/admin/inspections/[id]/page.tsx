import { notFound } from "next/navigation";

import { InspectionDetailView } from "@/components/admin/detail/entity-detail-views";
import { createClient } from "@/lib/supabase/server";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminInspectionViewPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: inspection } = await supabase.from("vehicle_inspections").select("*").eq("id", id).maybeSingle();

  if (!inspection) {
    notFound();
  }

  const { data: vehicle } = await supabase.from("vehicles").select("vehicle_no").eq("id", inspection.vehicle_id).maybeSingle();

  return <InspectionDetailView data={inspection} vehicleNo={vehicle?.vehicle_no ?? "—"} />;
}
