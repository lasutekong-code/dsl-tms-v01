import { notFound } from "next/navigation";

import { ClientContactDetailView } from "@/components/admin/detail/entity-detail-views";
import { createClient } from "@/lib/supabase/server";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminClientContactViewPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: contact } = await supabase.from("client_contacts").select("*").eq("id", id).maybeSingle();

  if (!contact) {
    notFound();
  }

  const [{ data: client }, { data: center }] = await Promise.all([
    supabase.from("clients").select("client_name").eq("id", contact.client_id).maybeSingle(),
    contact.center_id
      ? supabase.from("centers").select("center_name").eq("id", contact.center_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return (
    <ClientContactDetailView
      data={contact}
      clientName={client?.client_name ?? "—"}
      centerName={center?.center_name ?? null}
    />
  );
}
