import Link from "next/link";

import { roleLabels, type Profile } from "@/lib/auth/profile-display";
import { cn } from "@/lib/utils/cn";

const NAV = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/clients", label: "거래처 관리" },
  { href: "/admin/centers", label: "센터 관리" },
  { href: "/admin/client-contacts", label: "담당자 관리" },
  { href: "/admin/drivers", label: "운전자 관리" },
  { href: "/admin/owners", label: "사업주 관리" },
  { href: "/admin/vehicles", label: "차량 관리" },
  { href: "/admin/assignments", label: "차량 배정" },
  { href: "/admin/insurances", label: "보험 관리" },
  { href: "/admin/inspections", label: "점검 관리" },
  { href: "/admin/contracts", label: "계약 관리" },
  { href: "/admin/photos", label: "사진 관리" },
  { href: "/admin/permissions", label: "권한 관리" },
  { href: "/admin/logs", label: "로그 관리" },
] as const;

export function AdminSidebar({ profile, pathname }: { profile: Profile; pathname: string }) {
  return (
    <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white lg:block">
      <div className="flex h-full flex-col gap-6 px-3 py-6">
        <div className="px-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">관리자</p>
          <p className="mt-1 truncate text-sm font-medium text-slate-900">{profile.full_name ?? profile.email ?? "—"}</p>
          <span className="mt-2 inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-800">
            {roleLabels[profile.role as keyof typeof roleLabels] ?? profile.role}
          </span>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-blue-50 text-blue-800" : "text-slate-700 hover:bg-slate-50",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-100 px-2 pt-2">
          <Link href="/search" className="text-sm text-slate-600 hover:text-blue-600">
            차량 검색으로
          </Link>
        </div>
      </div>
    </aside>
  );
}

export function AdminMobileNav({ pathname }: { pathname: string }) {
  return (
    <div className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 lg:hidden">
      {NAV.map((item) => {
        const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium",
              active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
