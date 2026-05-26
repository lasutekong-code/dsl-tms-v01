import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { requireProfile, roleLabels } from "@/lib/auth/get-profile";

export default async function DashboardPage() {
  const profile = await requireProfile();
  const isAdmin = profile.role === "admin";

  return (
    <AppShell profile={profile}>
      <div className="stack">
        <div>
          <p style={{ color: "var(--primary)", fontWeight: 800, margin: 0 }}>{roleLabels[profile.role]}</p>
          <h1 style={{ fontSize: 32, margin: "8px 0" }}>
            {profile.full_name ?? profile.email ?? "사용자"}님, 안녕하세요.
          </h1>
          <p style={{ color: "var(--muted)", margin: 0 }}>
            로그인한 사용자의 profiles.role 값을 기준으로 사용 가능한 화면을 보여줍니다.
          </p>
        </div>

        <div className="grid">
          <Card>
            <h2 style={{ marginTop: 0 }}>차량 검색</h2>
            <p style={{ color: "var(--muted)" }}>거래처명, 차량번호, 운전자명으로 차량을 찾습니다.</p>
            <Link href="/search" style={{ color: "var(--primary)", fontWeight: 800 }}>
              검색하기
            </Link>
          </Card>

          {isAdmin ? (
            <>
              <Card>
                <h2 style={{ marginTop: 0 }}>차량 관리</h2>
                <p style={{ color: "var(--muted)" }}>차량, 제원, 사진, 배정 정보를 관리합니다.</p>
                <Link href="/admin/vehicles" style={{ color: "var(--primary)", fontWeight: 800 }}>
                  관리 화면
                </Link>
              </Card>
              <Card>
                <h2 style={{ marginTop: 0 }}>권한 및 로그</h2>
                <p style={{ color: "var(--muted)" }}>접근권한과 민감정보 감사 로그를 확인합니다.</p>
                <Link href="/admin/permissions" style={{ color: "var(--primary)", fontWeight: 800 }}>
                  권한 관리
                </Link>
              </Card>
            </>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
