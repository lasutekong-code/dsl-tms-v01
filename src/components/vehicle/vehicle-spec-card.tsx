import { DetailField, DetailFieldGrid } from "@/components/vehicle/detail-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatKilograms, formatMillimeters } from "@/lib/vehicles/format";
import type { VehicleDetail } from "@/types/vehicle";

export function VehicleSpecCard({ detail }: { detail: VehicleDetail }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>차량 제원 / 특장</CardTitle>
      </CardHeader>
      <CardContent>
        <DetailFieldGrid>
          <DetailField label="특장상태" value={detail.special_equipment} />
          <DetailField label="차량높이" value={formatMillimeters(detail.height_mm)} />
          <DetailField label="차량길이" value={formatMillimeters(detail.length_mm)} />
          <DetailField label="차량너비" value={formatMillimeters(detail.width_mm)} />
          <DetailField label="최대적재량" value={formatKilograms(detail.max_load_kg)} />
        </DetailFieldGrid>
      </CardContent>
    </Card>
  );
}
