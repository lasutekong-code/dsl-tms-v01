import { InspectionForm } from "@/components/forms/inspection-form";
import { createClient } from "@/lib/supabase/server";

export default async function AdminInspectionsNewPage() {
  const supabase = await createClient();
  const { data: vehicles } = await supabase.from("vehicles").select("id, vehicle_no").order("vehicle_no");
  return <InspectionForm mode="create" vehicles={vehicles ?? []} />;
}
