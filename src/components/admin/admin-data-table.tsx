import type { ReactNode } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

export function AdminSearchBar({
  name = "q",
  defaultValue,
  placeholder = "검색…",
  className,
}: {
  name?: string;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <form method="get" className={cn("flex w-full max-w-md gap-2", className)}>
      <Input name={name} defaultValue={defaultValue} placeholder={placeholder} className="bg-white" />
      <button
        type="submit"
        className="h-10 shrink-0 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800"
      >
        검색
      </button>
    </form>
  );
}

export function AdminDataTableShell({
  toolbar,
  children,
  className,
}: {
  toolbar?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {toolbar ? <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">{toolbar}</div> : null}
      {children}
    </div>
  );
}
