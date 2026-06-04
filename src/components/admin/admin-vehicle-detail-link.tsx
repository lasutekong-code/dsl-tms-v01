import Link from "next/link";

import { vehicleDetailHref } from "@/lib/vehicles/vehicle-detail-back";
import { cn } from "@/lib/utils/cn";

export function AdminVehicleDetailLink({
  vehicleId,
  returnTo,
  children,
  className,
}: {
  vehicleId: string | null | undefined;
  /** 목록 화면 URL (검색·페이지 쿼리 포함 가능). 차량 상세의 '목록으로' 복귀 경로로 전달됩니다. */
  returnTo?: string;
  children: React.ReactNode;
  className?: string;
}) {
  if (!vehicleId) {
    return <span className={cn("font-medium text-slate-900", className)}>{children}</span>;
  }

  return (
    <Link
      href={vehicleDetailHref(vehicleId, returnTo)}
      className={cn("font-medium text-blue-600 hover:underline", className)}
    >
      {children}
    </Link>
  );
}
