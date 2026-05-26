import { daysUntil } from "@/lib/vehicles/format";
import { Badge } from "@/components/ui/badge";
import type { VehicleDetail } from "@/types/vehicle";

const STATUS_MAP: Record<
  string,
  { label: string; variant: "success" | "secondary" | "warning" | "danger" }
> = {
  active: { label: "운행중", variant: "success" },
  inactive: { label: "비운행", variant: "secondary" },
  suspended: { label: "정지", variant: "warning" },
  terminated: { label: "해지", variant: "danger" },
};

export function VehicleStatusBadge({ status }: { status: VehicleDetail["status"] }) {
  const key = typeof status === "string" ? status.toLowerCase() : "inactive";
  const config = STATUS_MAP[key] ?? { label: status ?? "미지정", variant: "secondary" as const };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function DueDateWarningBadge({
  label,
  date,
  thresholdDays = 30,
}: {
  label: string;
  date: string | null | undefined;
  thresholdDays?: number;
}) {
  const remaining = daysUntil(date);

  if (remaining === null || remaining > thresholdDays) {
    return null;
  }

  const variant = remaining <= 7 ? "danger" : "warning";

  return (
    <Badge variant={variant}>
      {label} D-{remaining}
    </Badge>
  );
}
