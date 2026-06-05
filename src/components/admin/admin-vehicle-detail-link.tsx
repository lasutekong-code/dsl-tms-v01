"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils/cn";

export function AdminVehicleDetailLink({
  vehicleId,
  children,
  className,
}: {
  vehicleId: string | null | undefined;
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (!vehicleId) {
    return <span className={cn("font-medium text-slate-900", className)}>{children}</span>;
  }

  // 현재 페이지 경로 + 쿼리스트링을 from으로 저장
  const queryString = searchParams.toString();
  const fromPath = queryString ? `${pathname}?${queryString}` : pathname;
  const href = `/vehicles/${vehicleId}?from=${encodeURIComponent(fromPath)}`;

  return (
    <Link
      href={href}
      className={cn("font-medium text-blue-600 hover:underline", className)}
    >
      {children}
    </Link>
  );
}