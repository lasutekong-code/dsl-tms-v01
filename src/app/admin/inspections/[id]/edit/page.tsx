import { notFound } from "next/navigation";

import { InspectionForm } from "@/components/forms/inspection-form";
import { createClient } from "@/lib/supabase/server";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminInspectionsEditPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data }, { data: vehicles }] = await Promise.all([
    supabase.from("vehicle_inspections").select("*").eq("id", id).maybeSingle(),
    supabase.from("vehicles").select("id, vehicle_no").order("vehicle_no"),
  ]);

  if (!data) {
    notFound();
  }

  return <InspectionForm mode="edit" defaultValues={data} vehicles={vehicles ?? []} />;
}
