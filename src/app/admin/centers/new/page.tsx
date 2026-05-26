import { CenterForm } from "@/components/forms/center-form";
import { createClient } from "@/lib/supabase/server";

export default async function AdminCentersNewPage() {
  const supabase = await createClient();
  const { data: clients } = await supabase.from("clients").select("id, client_name").order("client_name");

  return <CenterForm mode="create" clients={clients ?? []} />;
}
