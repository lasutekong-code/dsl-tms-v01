import { notFound } from "next/navigation";

import { InsuranceDetailView } from "@/components/admin/detail/entity-detail-views";
import { createClient } from "@/lib/supabase/server";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminInsuranceViewPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: insurance } = await supabase.from("insurances").select("*").eq("id", id).maybeSingle();

  if (!insurance) {
    notFound();
  }

  const { data: vehicle } = await supabase.from("vehicles").select("vehicle_no").eq("id", insurance.vehicle_id).maybeSingle();

  return <InsuranceDetailView data={insurance} vehicleNo={vehicle?.vehicle_no ?? "—"} />;
}
