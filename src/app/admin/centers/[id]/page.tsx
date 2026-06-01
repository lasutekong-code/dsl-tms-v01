import { notFound } from "next/navigation";

import { CenterDetailView } from "@/components/admin/detail/entity-detail-views";
import { createClient } from "@/lib/supabase/server";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminCenterViewPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: center } = await supabase.from("centers").select("*").eq("id", id).maybeSingle();

  if (!center) {
    notFound();
  }

  const { data: client } = await supabase.from("clients").select("client_name").eq("id", center.client_id).maybeSingle();

  return <CenterDetailView data={center} clientName={client?.client_name ?? "—"} />;
}
