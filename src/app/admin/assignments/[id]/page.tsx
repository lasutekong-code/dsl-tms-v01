import { notFound } from "next/navigation";

import { AssignmentDetailView } from "@/components/admin/detail/entity-detail-views";
import { decryptOwnerRow } from "@/lib/admin/pii-transform";
import { decryptPii } from "@/lib/crypto/pii";
import { createClient } from "@/lib/supabase/server";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminAssignmentViewPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: assignment } = await supabase.from("vehicle_assignments").select("*").eq("id", id).maybeSingle();

  if (!assignment) {
    notFound();
  }

  const [{ data: vehicle }, { data: driver }, { data: client }, { data: center }, { data: owner }] = await Promise.all([
    supabase.from("vehicles").select("vehicle_no").eq("id", assignment.vehicle_id).maybeSingle(),
    supabase.from("drivers").select("driver_name").eq("id", assignment.driver_id).maybeSingle(),
    supabase.from("clients").select("client_name").eq("id", assignment.client_id).maybeSingle(),
    supabase.from("centers").select("center_name").eq("id", assignment.center_id).maybeSingle(),
    supabase.from("owners").select("*").eq("id", assignment.owner_id).maybeSingle(),
  ]);

  const driverName = driver ? decryptPii(driver.driver_name) ?? driver.driver_name ?? "—" : "—";
  const ownerName = owner ? decryptOwnerRow(owner).owner_name ?? "—" : "—";

  return (
    <AssignmentDetailView
      data={assignment}
      vehicleNo={vehicle?.vehicle_no ?? "—"}
      driverName={driverName}
      clientName={client?.client_name ?? "—"}
      centerName={center?.center_name ?? "—"}
      ownerName={ownerName}
    />
  );
}
