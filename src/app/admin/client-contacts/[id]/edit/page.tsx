import { notFound } from "next/navigation";

import { ClientContactForm } from "@/components/forms/client-contact-form";
import { createClient } from "@/lib/supabase/server";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminClientContactsEditPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data }, { data: clients }, { data: centers }] = await Promise.all([
    supabase.from("client_contacts").select("*").eq("id", id).maybeSingle(),
    supabase.from("clients").select("id, client_name").order("client_name"),
    supabase.from("centers").select("id, client_id, center_name").order("center_name"),
  ]);

  if (!data) {
    notFound();
  }

  return <ClientContactForm mode="edit" defaultValues={data} clients={clients ?? []} centers={centers ?? []} />;
}
