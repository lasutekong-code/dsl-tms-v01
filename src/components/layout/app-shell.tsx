import Link from "next/link";
import type { PropsWithChildren } from "react";

import { roleLabels, type Profile } from "@/lib/auth/profile-display";

export function AppShell({ children, profile }: PropsWithChildren<{ profile: Profile }>) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/search" className="text-lg font-bold tracking-tight text-slate-900">
            DSL TMS
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
            <Link href="/search" className="hover:text-blue-600">
              검색
            </Link>
            {profile.role === "admin" ? (
              <Link href="/admin/vehicles" className="hover:text-blue-600">
                관리
              </Link>
            ) : null}
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {roleLabels[profile.role as keyof typeof roleLabels] ?? profile.role}
            </span>
            <Link href="/auth/logout" className="rounded-md border border-slate-200 px-3 py-1 text-xs hover:bg-slate-50">
              로그아웃
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
