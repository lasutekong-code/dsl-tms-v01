"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  Shield,
  Truck,
  Users,
  Wrench,
} from "lucide-react";

import { roleLabels, type Profile } from "@/lib/auth/profile-types";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  adminOnly?: boolean;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "대시보드", icon: LayoutDashboard },
  { href: "/search", label: "차량 검색", icon: Search },
  { href: "/admin/vehicles", label: "차량 관리", icon: Truck, adminOnly: true },
  { href: "/admin/drivers", label: "운전자 관리", icon: Users, adminOnly: true },
  { href: "/admin/clients", label: "거래처 관리", icon: Building2, adminOnly: true },
  { href: "/admin/logs", label: "점검/보험", icon: Wrench, adminOnly: true },
  { href: "/admin/logs", label: "로그/감사", icon: FileText, adminOnly: true },
  { href: "/admin/permissions", label: "사용자 관리", icon: ClipboardList, adminOnly: true },
  { href: "/admin/permissions", label: "권한 설정", icon: Shield, adminOnly: true },
  { href: "/admin/owners", label: "설정", icon: Settings, adminOnly: true },
];

type AppSidebarProps = {
  profile: Profile;
  onLogout?: () => void;
};

export function AppSidebar({ profile, onLogout }: AppSidebarProps) {
  const pathname = usePathname();
  const displayName = profile.full_name ?? profile.email ?? "사용자";
  const initial = displayName.trim().charAt(0).toUpperCase() || "U";
  const roleLabel = roleLabels[profile.role] ?? profile.role;

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-white">
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Truck className="size-5" />
          </div>
          <span className="text-base font-semibold text-foreground">차량관리</span>
        </div>
      </div>

      <div className="border-b border-border bg-[rgba(103,58,183,0.06)] px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-[#673ab7] text-base font-semibold text-white">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-medium text-foreground">{displayName}</p>
            <p className="text-sm font-medium text-[#673ab7]">{roleLabel}</p>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
        {navItems.map((item) => {
          if (item.adminOnly && profile.role !== "admin") {
            return null;
          }

          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              className={cn(
                "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-[#404040] hover:bg-muted",
              )}
              href={item.href}
              key={`${item.href}-${item.label}`}
            >
              <Icon className="size-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <button
          className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-[#404040] transition-colors hover:bg-muted"
          onClick={onLogout}
          type="button"
        >
          <LogOut className="size-5" />
          로그아웃
        </button>
      </div>
    </aside>
  );
}
