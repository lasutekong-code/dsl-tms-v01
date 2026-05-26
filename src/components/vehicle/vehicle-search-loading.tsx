import { Loader2 } from "lucide-react";

export function VehicleSearchLoading() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-white py-16 text-muted-foreground"
    >
      <Loader2 className="size-8 animate-spin text-primary" />
      <p className="text-sm">차량 정보를 검색하고 있습니다.</p>
    </div>
  );
}
