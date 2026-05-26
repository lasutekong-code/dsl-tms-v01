import { notFound } from "next/navigation";

import { DriverAddressesPanel } from "@/components/forms/driver-addresses-panel";
import { DriverForm } from "@/components/forms/driver-form";
import { DriverMemosPanel } from "@/components/forms/driver-memos-panel";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { createClient } from "@/lib/supabase/server";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminDriversEditPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: driver }, { data: addresses }, { data: memos }] = await Promise.all([
    supabase.from("drivers").select("*").eq("id", id).maybeSingle(),
    supabase.from("addresses").select("*").eq("target_table", "drivers").eq("target_id", id),
    supabase.from("memos").select("*").eq("target_table", "drivers").eq("target_id", id).order("created_at", { ascending: false }),
  ]);

  if (!driver) {
    notFound();
  }

  return (
    <div className="space-y-12">
      <DriverForm mode="edit" defaultValues={driver} />
      <div className="border-t border-slate-200 pt-10" id="driver-addresses">
        <AdminPageHeader title="운전자 주소" description="자택·우편 주소를 이 운전자에 연결해 저장합니다." />
        <DriverAddressesPanel driverId={id} addresses={addresses ?? []} />
      </div>
      <div className="border-t border-slate-200 pt-10" id="driver-memos">
        <AdminPageHeader title="운전자 메모" description="내부 메모를 등록하고 목록에서 수정할 수 있습니다." />
        <DriverMemosPanel driverId={id} memos={memos ?? []} />
      </div>
    </div>
  );
}
