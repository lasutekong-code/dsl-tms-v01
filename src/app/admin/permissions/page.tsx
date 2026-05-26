import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminPermissionsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader title="권한 관리" description="사용자·역할 권한 설정은 추후 연동됩니다." />
      <Card>
        <CardContent className="py-8 text-sm text-slate-600">profiles 및 접근 테이블 기반 UI는 다음 단계에서 제공합니다.</CardContent>
      </Card>
    </div>
  );
}
