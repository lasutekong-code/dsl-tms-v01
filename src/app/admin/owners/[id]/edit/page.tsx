import { notFound } from "next/navigation";

import { OwnerForm } from "@/components/forms/owner-form";
import { createClient } from "@/lib/supabase/server";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminOwnersEditPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("owners").select("*").eq("id", id).maybeSingle();
  if (!data) {
    notFound();
  }

  return <OwnerForm mode="edit" defaultValues={data} />;
}
