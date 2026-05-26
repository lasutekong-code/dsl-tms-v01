import { notFound } from "next/navigation";

import { ClientForm } from "@/components/forms/client-form";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminClientsEditPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("clients").select("*").eq("id", id).maybeSingle();

  if (!data) {
    notFound();
  }

  return <ClientForm mode="edit" defaultValues={data} />;
}
