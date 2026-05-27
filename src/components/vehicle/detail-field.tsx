import { displayValue } from "@/lib/vehicles/format";
import { cn } from "@/lib/utils/cn";

type DetailFieldProps = {
  label: string;
  value: string | number | boolean | null | undefined;
  className?: string;
  valueClassName?: string;
};

export function DetailField({ label, value, className, valueClassName }: DetailFieldProps) {
  return (
    <div className={cn("min-w-0 space-y-1", className)}>
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className={cn("break-words text-sm font-medium text-slate-900", valueClassName)}>
        {displayValue(value)}
      </dd>
    </div>
  );
}

export function DetailFieldGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <dl className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2", className)}>{children}</dl>
  );
}
