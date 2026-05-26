import { AssignmentForm } from "@/components/forms/assignment-form";
import { createClient } from "@/lib/supabase/server";

export default async function AdminAssignmentsNewPage() {
  const supabase = await createClient();
  const [{ data: vehicles }, { data: clients }, { data: centers }, { data: drivers }, { data: owners }] =
    await Promise.all([
      supabase.from("vehicles").select("id, vehicle_no").order("vehicle_no"),
      supabase.from("clients").select("id, client_name").order("client_name"),
      supabase.from("centers").select("id, client_id, center_name").order("center_name"),
      supabase.from("drivers").select("id, driver_name").order("driver_name"),
      supabase.from("owners").select("id, owner_name").order("owner_name"),
    ]);

  return (
    <AssignmentForm
      mode="create"
      vehicles={vehicles ?? []}
      clients={clients ?? []}
      centers={centers ?? []}
      drivers={drivers ?? []}
      owners={owners ?? []}
    />
  );
}
