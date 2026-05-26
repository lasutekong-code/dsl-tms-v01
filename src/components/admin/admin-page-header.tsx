import { cn } from "@/lib/utils/cn";

export function AdminPageHeader({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
      {description ? <p className="text-sm text-slate-600">{description}</p> : null}
    </div>
  );
}
