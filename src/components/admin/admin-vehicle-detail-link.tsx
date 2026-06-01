import Link from "next/link";

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
  if (!vehicleId) {
    return <span className={cn("font-medium text-slate-900", className)}>{children}</span>;
  }

  return (
    <Link href={`/vehicles/${vehicleId}`} className={cn("font-medium text-blue-600 hover:underline", className)}>
      {children}
    </Link>
  );
}
