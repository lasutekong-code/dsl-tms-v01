import { notFound } from "next/navigation";

import { CenterForm } from "@/components/forms/center-form";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminCentersEditPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data }, { data: clients }] = await Promise.all([
    supabase.from("centers").select("*").eq("id", id).maybeSingle(),
    supabase.from("clients").select("id, client_name").order("client_name"),
  ]);

  if (!data) {
    notFound();
  }

  return <CenterForm mode="edit" defaultValues={data} clients={clients ?? []} />;
}
