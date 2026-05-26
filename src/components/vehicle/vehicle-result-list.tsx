import { VehicleResultCard } from "@/components/vehicle/vehicle-result-card";
import type { VehicleSearchResult } from "@/types/vehicle";

type VehicleResultListProps = {
  results: VehicleSearchResult[];
};

export function VehicleResultList({ results }: VehicleResultListProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {results.map((vehicle) => (
        <VehicleResultCard key={vehicle.vehicle_id} vehicle={vehicle} />
      ))}
    </div>
  );
}
