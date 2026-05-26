import { ClientContactForm } from "@/components/forms/client-contact-form";
import { createClient } from "@/lib/supabase/server";

export default async function AdminClientContactsNewPage() {
  const supabase = await createClient();
  const [{ data: clients }, { data: centers }] = await Promise.all([
    supabase.from("clients").select("id, client_name").order("client_name"),
    supabase.from("centers").select("id, client_id, center_name").order("center_name"),
  ]);

  return <ClientContactForm mode="create" clients={clients ?? []} centers={centers ?? []} />;
}
