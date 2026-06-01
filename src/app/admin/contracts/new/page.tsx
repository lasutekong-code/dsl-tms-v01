import { ContractForm } from "@/components/forms/contract-form";
import { decryptPii } from "@/lib/crypto/pii";
import { createClient } from "@/lib/supabase/server";

export default async function AdminContractsNewPage() {
  const supabase = await createClient();
  const [{ data: vehicles }, { data: owners }, { data: clients }] = await Promise.all([
    supabase.from("vehicles").select("id, vehicle_no").order("vehicle_no"),
    supabase.from("owners").select("id, owner_name").order("owner_name"),
    supabase.from("clients").select("id, client_name").order("client_name"),
  ]);

  return (
    <ContractForm
      mode="create"
      vehicles={vehicles ?? []}
      owners={(owners ?? []).map((o) => ({ id: o.id, owner_name: decryptPii(o.owner_name) ?? o.owner_name ?? "" }))}
      clients={clients ?? []}
    />
  );
}
