import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { requireProfile, roleLabels } from "@/lib/auth/get-profile";

export default async function DashboardPage() {
  const profile = await requireProfile();
  const isAdmin = profile.role === "admin";

  return (
    <AppShell profile={profile}>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-extrabold text-blue-700">
            {roleLabels[profile.role as keyof typeof roleLabels] ?? profile.role}
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            {profile.full_name ?? profile.email ?? "사용자"}님, 안녕하세요.
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            로그인한 사용자의 profiles.role 값을 기준으로 사용 가능한 화면을 보여줍니다.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Card>
            <CardContent className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-950">차량 검색</h2>
              <p className="text-sm leading-6 text-slate-600">거래처명, 차량번호, 운전자명으로 차량을 찾습니다.</p>
              <Link href="/search" className="inline-flex text-sm font-extrabold text-blue-700 hover:text-blue-800">
                검색하기
              </Link>
            </CardContent>
          </Card>

          {isAdmin ? (
            <>
              <Card>
                <CardContent className="space-y-3">
                  <h2 className="text-lg font-semibold text-slate-950">차량 관리</h2>
                  <p className="text-sm leading-6 text-slate-600">차량, 제원, 사진, 배정 정보를 관리합니다.</p>
                  <Link
                    href="/admin/vehicles"
                    className="inline-flex text-sm font-extrabold text-blue-700 hover:text-blue-800"
                  >
                    관리 화면
                  </Link>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="space-y-3">
                  <h2 className="text-lg font-semibold text-slate-950">권한 및 로그</h2>
                  <p className="text-sm leading-6 text-slate-600">접근권한과 민감정보 감사 로그를 확인합니다.</p>
                  <Link
                    href="/admin/permissions"
                    className="inline-flex text-sm font-extrabold text-blue-700 hover:text-blue-800"
                  >
                    권한 관리
                  </Link>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
