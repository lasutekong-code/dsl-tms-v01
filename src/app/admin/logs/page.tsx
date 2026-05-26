import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminLogsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader title="로그 관리" description="감사 로그 조회는 추후 연동됩니다." />
      <Card>
        <CardContent className="py-8 text-sm text-slate-600">audit_logs 테이블 기반 목록·필터는 다음 단계에서 제공합니다.</CardContent>
      </Card>
    </div>
  );
}
