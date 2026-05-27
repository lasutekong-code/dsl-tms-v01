import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export function FieldGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("grid gap-4 md:grid-cols-2", className)}>{children}</div>;
}

export function FieldFull({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("md:col-span-2", className)}>{children}</div>;
}
