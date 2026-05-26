import { AdminPage } from "@/components/layout/admin-page";
import { Card } from "@/components/ui/card";

export default async function NewVehiclePage() {
  return (
    <AdminPage>
      <Card>
        <h1 style={{ marginTop: 0 }}>새 차량 등록</h1>
        <p style={{ color: "var(--muted)" }}>차량 등록 폼을 연결할 자리입니다.</p>
      </Card>
    </AdminPage>
  );
}
