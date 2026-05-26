import { AdminPage } from "@/components/layout/admin-page";
import { Card } from "@/components/ui/card";

export default async function AdminPermissionsPage() {
  return (
    <AdminPage>
      <Card>
        <h1 style={{ marginTop: 0 }}>권한 관리</h1>
        <p style={{ color: "var(--muted)" }}>
          user_client_access와 user_vehicle_access 기반 접근권한을 관리하는 화면입니다.
        </p>
      </Card>
    </AdminPage>
  );
}
