import { SearchX } from "lucide-react";

type VehicleEmptyStateProps = {
  title: string;
  description?: string;
};

export function VehicleEmptyState({ title, description }: VehicleEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-white px-6 py-16 text-center">
      <SearchX className="size-10 text-muted-foreground/70" />
      <div className="space-y-1">
        <p className="text-base font-medium text-foreground">{title}</p>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
    </div>
  );
}
