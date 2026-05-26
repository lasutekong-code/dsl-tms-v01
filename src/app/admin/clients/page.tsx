import { AdminPage } from "@/components/layout/admin-page";
import { Card } from "@/components/ui/card";

export default async function AdminClientsPage() {
  return (
    <AdminPage>
      <Card>
        <h1 style={{ marginTop: 0 }}>거래처 관리</h1>
        <p style={{ color: "var(--muted)" }}>거래처, 센터, 거래처 담당자를 관리하는 화면입니다.</p>
      </Card>
    </AdminPage>
  );
}
