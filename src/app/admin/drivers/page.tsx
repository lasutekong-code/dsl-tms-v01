import { AdminPage } from "@/components/layout/admin-page";
import { Card } from "@/components/ui/card";

export default async function AdminDriversPage() {
  return (
    <AdminPage>
      <Card>
        <h1 style={{ marginTop: 0 }}>운전자 관리</h1>
        <p style={{ color: "var(--muted)" }}>운전자 기본정보와 사진을 관리하는 화면입니다.</p>
      </Card>
    </AdminPage>
  );
}
