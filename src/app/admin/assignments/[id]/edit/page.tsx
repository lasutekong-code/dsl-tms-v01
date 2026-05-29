import { notFound } from "next/navigation";

import { AssignmentForm } from "@/components/forms/assignment-form";
import { decryptDriverSelectOptions, decryptOwnerSelectOptions } from "@/lib/admin/decrypt-select-options";
import { createClient } from "@/lib/supabase/server";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminAssignmentsEditPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data }, { data: vehicles }, { data: clients }, { data: centers }, { data: drivers }, { data: owners }] =
    await Promise.all([
      supabase.from("vehicle_assignments").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("vehicle_card_view")
        .select("vehicle_id, vehicle_no, special_equipment")
        .order("vehicle_no"),
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
      vehicles={(vehicles ?? []).map((v) => ({
        id: String(v.vehicle_id),
        vehicle_no: v.vehicle_no ?? "-",
        special_equipment: typeof v.special_equipment === "string" ? v.special_equipment : null,
      }))}
      clients={clients ?? []}
      centers={centers ?? []}
      drivers={decryptDriverSelectOptions(drivers ?? [])}
      owners={decryptOwnerSelectOptions(owners ?? [])}
    />
  );
}
