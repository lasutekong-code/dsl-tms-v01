import { notFound } from "next/navigation";

import { InsuranceForm } from "@/components/forms/insurance-form";
import { createClient } from "@/lib/supabase/server";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminInsurancesEditPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data }, { data: vehicles }] = await Promise.all([
    supabase.from("insurances").select("*").eq("id", id).maybeSingle(),
    supabase.from("vehicles").select("id, vehicle_no").order("vehicle_no"),
  ]);

  if (!data) {
    notFound();
  }

  return <InsuranceForm mode="edit" defaultValues={data} vehicles={vehicles ?? []} />;
}
