import { InsuranceForm } from "@/components/forms/insurance-form";
import { createClient } from "@/lib/supabase/server";

export default async function AdminInsurancesNewPage() {
  const supabase = await createClient();
  const { data: vehicles } = await supabase.from("vehicles").select("id, vehicle_no").order("vehicle_no");
  return <InsuranceForm mode="create" vehicles={vehicles ?? []} />;
}
