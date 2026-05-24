import { AdminPage } from "@/components/layout/admin-page";
import { Card } from "@/components/ui/card";

export default async function AdminLogsPage() {
  return (
    <AdminPage>
      <Card>
        <h1 style={{ marginTop: 0 }}>감사 로그</h1>
        <p style={{ color: "var(--muted)" }}>search_logs와 audit_logs를 확인하는 관리자 화면입니다.</p>
      </Card>
    </AdminPage>
  );
}
