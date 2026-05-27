import { notFound } from "next/navigation";

import { AssignmentForm } from "@/components/forms/assignment-form";
import { createClient } from "@/lib/supabase/server";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminAssignmentsEditPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data }, { data: vehicles }, { data: clients }, { data: centers }, { data: drivers }, { data: owners }] =
    await Promise.all([
      supabase.from("vehicle_assignments").select("*").eq("id", id).maybeSingle(),
      supabase.from("vehicles").select("id, vehicle_no").order("vehicle_no"),
      supabase.from("clients").select("id, client_name").order("client_name"),
      supabase.from("centers").select("id, client_id, center_name").order("center_name"),
      supabase.from("drivers").select("id, driver_name").order("driver_name"),
      supabase.from("owners").select("id, owner_name").order("owner_name"),
    ]);

  if (!data) {
    notFound();
  }

  return (
    <AssignmentForm
      mode="edit"
      defaultValues={data}
      vehicles={vehicles ?? []}
      clients={clients ?? []}
      centers={centers ?? []}
      drivers={drivers ?? []}
      owners={owners ?? []}
    />
  );
}
