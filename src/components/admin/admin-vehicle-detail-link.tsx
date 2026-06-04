"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import {
  buildReturnToFromLocation,
  setVehicleDetailReturnTo,
  vehicleDetailHref,
} from "@/lib/vehicles/vehicle-detail-return";
import { cn } from "@/lib/utils/cn";

function AdminVehicleDetailLinkInner({
  vehicleId,
  returnTo: returnToProp,
  children,
  className,
}: {
  vehicleId: string | null | undefined;
  returnTo?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const autoReturnTo = buildReturnToFromLocation(pathname, searchParams.toString());
  const returnTo = returnToProp?.trim() || autoReturnTo || undefined;

  if (!vehicleId) {
    return <span className={cn("font-medium text-slate-900", className)}>{children}</span>;
  }

  const href = vehicleDetailHref(vehicleId, returnTo);

  return (
    <Link
      href={href}
      className={cn("font-medium text-blue-600 hover:underline", className)}
      onClick={() => {
        if (returnTo) {
          setVehicleDetailReturnTo(returnTo);
        }
      }}
    >
      {children}
    </Link>
  );
}

export function AdminVehicleDetailLink(props: {
  vehicleId: string | null | undefined;
  returnTo?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Suspense fallback={<span className={cn("font-medium text-slate-900", props.className)}>{props.children}</span>}>
      <AdminVehicleDetailLinkInner {...props} />
    </Suspense>
  );
}
