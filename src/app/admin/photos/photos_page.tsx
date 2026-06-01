export const dynamic = "force-dynamic";

import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminPhotosHubPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="사진 관리"
        description="차량 또는 운전자 목록에서 해당 항목을 연 뒤 사진 업로드 화면으로 이동합니다."
      />
      <Card>
        <CardContent className="flex flex-wrap gap-3 py-6">
          <Button asChild>
            <Link href="/admin/vehicles">차량 목록에서 사진 업로드</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/drivers">운전자 목록에서 사진 업로드</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
