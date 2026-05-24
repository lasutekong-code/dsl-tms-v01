import Link from "next/link";

import { AdminPage } from "@/components/layout/admin-page";
import { Card } from "@/components/ui/card";

export default async function AdminVehiclesPage() {
  return (
    <AdminPage>
      <Card>
        <h1 style={{ marginTop: 0 }}>차량 관리</h1>
        <p style={{ color: "var(--muted)" }}>차량 기본정보, 제원, 사진, 배정을 관리하는 화면입니다.</p>
        <Link href="/admin/vehicles/new" style={{ color: "var(--primary)", fontWeight: 800 }}>
          새 차량 등록
        </Link>
      </Card>
    </AdminPage>
  );
}
