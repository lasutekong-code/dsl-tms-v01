export const dynamic = "force-dynamic";

import { AdminDashboardEditor } from "@/components/admin/admin-dashboard-editor";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("admin_dashboard_settings")
    .select("quick_guide, photo_guide, updated_at")
    .eq("id", "default")
    .maybeSingle();

  const quickGuide =
    data?.quick_guide ??
    "거래처 → 센터 → 담당자 순으로 등록하면 연계 선택이 수월합니다.\n차량 배정은 차량, 거래처, 센터, 운전자, 사업주를 모두 등록한 뒤 진행하세요.";
  const photoGuide =
    data?.photo_guide ??
    "차량 사진은 차량 수정 화면 하단에서 확인·업로드할 수 있습니다.\n운전자 사진은 운전자 수정 화면 상단에서 확인할 수 있습니다.";

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="관리자 대시보드"
        description="아래 안내 문구는 관리자가 수정해 게시할 수 있습니다. 등록·수정 메뉴는 왼쪽 사이드바에서 선택하세요."
      />
      <AdminDashboardEditor
        key={`${data?.updated_at ?? "init"}-${quickGuide.length}`}
        initialQuickGuide={quickGuide}
        initialPhotoGuide={photoGuide}
      />
    </div>
  );
}
