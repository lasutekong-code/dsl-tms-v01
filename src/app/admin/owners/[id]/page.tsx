import { notFound } from "next/navigation";

import { OwnerDetailView } from "@/components/admin/detail/entity-detail-views";
import { decryptOwnerRow } from "@/lib/admin/pii-transform";
import { createClient } from "@/lib/supabase/server";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminOwnerViewPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: owner } = await supabase.from("owners").select("*").eq("id", id).maybeSingle();

  if (!owner) {
    notFound();
  }

  return <OwnerDetailView data={decryptOwnerRow(owner)} />;
}
