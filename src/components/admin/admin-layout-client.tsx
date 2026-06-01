"use client";

import Link from "next/link";
import type { PropsWithChildren } from "react";
import { usePathname } from "next/navigation";

import { AdminMobileNav, AdminSidebar } from "@/components/admin/admin-sidebar";
import type { Profile } from "@/lib/auth/profile-display";

export function AdminLayoutClient({ profile, children }: PropsWithChildren<{ profile: Profile }>) {
  const pathname = usePathname() ?? "/admin";

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/admin" prefetch={false} className="text-lg font-bold tracking-tight text-slate-900">
            DSL TMS · 관리자
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
            <Link href="/search" prefetch={false} className="hover:text-blue-600">
              차량 검색
            </Link>
          </nav>
        </div>
      </header>
      <AdminMobileNav pathname={pathname} />
      <div className="mx-auto flex w-full max-w-[1600px] gap-0 lg:gap-6 lg:px-6 lg:py-6">
        <AdminSidebar profile={profile} pathname={pathname} />
        <div className="min-w-0 flex-1 px-4 py-6 lg:px-0 lg:py-0">{children}</div>
      </div>
    </div>
  );
}
