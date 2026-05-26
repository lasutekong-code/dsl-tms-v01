import { notFound } from "next/navigation";

import { ContractForm } from "@/components/forms/contract-form";
import { createClient } from "@/lib/supabase/server";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminContractsEditPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data }, { data: vehicles }, { data: owners }, { data: clients }] = await Promise.all([
    supabase.from("contracts").select("*").eq("id", id).maybeSingle(),
    supabase.from("vehicles").select("id, vehicle_no").order("vehicle_no"),
    supabase.from("owners").select("id, owner_name").order("owner_name"),
    supabase.from("clients").select("id, client_name").order("client_name"),
  ]);

  if (!data) {
    notFound();
  }

  return (
    <ContractForm mode="edit" defaultValues={data} vehicles={vehicles ?? []} owners={owners ?? []} clients={clients ?? []} />
  );
}
