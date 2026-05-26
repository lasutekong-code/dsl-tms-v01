import { notFound } from "next/navigation";

import { DriverForm } from "@/components/forms/driver-form";
import { createClient } from "@/lib/supabase/server";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminDriversEditPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("drivers").select("*").eq("id", id).maybeSingle();
  if (!data) {
    notFound();
  }

  return <DriverForm mode="edit" defaultValues={data} />;
}
