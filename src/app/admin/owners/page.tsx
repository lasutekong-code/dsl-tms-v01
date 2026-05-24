import { AdminPage } from "@/components/layout/admin-page";
import { Card } from "@/components/ui/card";

export default async function AdminOwnersPage() {
  return (
    <AdminPage>
      <Card>
        <h1 style={{ marginTop: 0 }}>사업주 관리</h1>
        <p style={{ color: "var(--muted)" }}>사업주 정보와 차량 접근권한을 관리하는 화면입니다.</p>
      </Card>
    </AdminPage>
  );
}
