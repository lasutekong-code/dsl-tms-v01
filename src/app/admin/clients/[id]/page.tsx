import { notFound } from "next/navigation";

import { ClientDetailView } from "@/components/admin/detail/entity-detail-views";
import { createClient } from "@/lib/supabase/server";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminClientViewPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("clients").select("*").eq("id", id).maybeSingle();

  if (!data) {
    notFound();
  }

  return <ClientDetailView data={data} />;
}
