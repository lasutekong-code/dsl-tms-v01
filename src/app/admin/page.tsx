import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader title="관리자 대시보드" description="등록·수정 메뉴는 왼쪽 사이드바에서 선택하세요." />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>빠른 안내</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            <p>거래처 → 센터 → 담당자 순으로 등록하면 연계 선택이 수월합니다.</p>
            <p>차량 배정은 차량, 거래처, 센터, 운전자, 사업주를 모두 등록한 뒤 진행하세요.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>사진 업로드</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            차량 사진은 차량 상세 경로의 사진 메뉴에서, 운전자 사진은 운전자 수정 화면의 사진 메뉴에서 업로드할 수 있습니다.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
