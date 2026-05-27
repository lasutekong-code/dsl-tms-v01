import Link from "next/link";

import { Button } from "@/components/ui/button";

export function AdminForbidden() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-lg flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-red-600">403</p>
      <h1 className="text-2xl font-bold text-slate-900">접근할 수 없습니다</h1>
      <p className="text-slate-600">관리자 권한이 있거나 활성화된 계정만 이 화면을 이용할 수 있습니다.</p>
      <Button asChild variant="outline">
        <Link href="/dashboard">대시보드로 이동</Link>
      </Button>
    </main>
  );
}
