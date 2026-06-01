import { notFound } from "next/navigation";

import { ContractDetailView } from "@/components/admin/detail/entity-detail-views";
import { decryptOwnerRow } from "@/lib/admin/pii-transform";
import { createClient } from "@/lib/supabase/server";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminContractViewPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: contract } = await supabase.from("contracts").select("*").eq("id", id).maybeSingle();

  if (!contract) {
    notFound();
  }

  const [{ data: vehicle }, { data: owner }, { data: client }] = await Promise.all([
    supabase.from("vehicles").select("vehicle_no").eq("id", contract.vehicle_id).maybeSingle(),
    supabase.from("owners").select("*").eq("id", contract.owner_id).maybeSingle(),
    supabase.from("clients").select("client_name").eq("id", contract.client_id).maybeSingle(),
  ]);

  const ownerName = owner ? decryptOwnerRow(owner).owner_name ?? "—" : "—";

  return (
    <ContractDetailView
      data={contract}
      vehicleNo={vehicle?.vehicle_no ?? "—"}
      ownerName={ownerName}
      clientName={client?.client_name ?? "—"}
    />
  );
}
