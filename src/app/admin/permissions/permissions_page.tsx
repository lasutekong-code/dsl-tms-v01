export const dynamic = "force-dynamic";

import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminPermissionsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader title="권한 관리" description="거래처·차량 단위 접근 권한 설정은 추후 연동됩니다." />
      <Card>
        <CardContent className="space-y-4 py-8 text-sm text-slate-600">
          <p>로그인 승인은 사용자 승인 메뉴에서 처리합니다.</p>
          <Button asChild variant="outline">
            <Link href="/admin/user-approvals">사용자 승인으로 이동</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
