import { DetailField, DetailFieldGrid } from "@/components/vehicle/detail-field";
import { VehicleStatusBadge } from "@/components/vehicle/vehicle-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatTonnage } from "@/lib/vehicles/format";
import type { VehicleDetail } from "@/types/vehicle";

export function VehicleBasicInfoCard({ detail }: { detail: VehicleDetail }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>차량 기본정보</CardTitle>
        <VehicleStatusBadge status={detail.status} />
      </CardHeader>
      <CardContent>
        <DetailFieldGrid>
          <DetailField label="차량번호" value={detail.vehicle_no} />
          <DetailField label="차명" value={detail.car_name} />
          <DetailField label="차량등록일" value={formatDate(detail.registration_date)} />
          <DetailField label="차량톤급" value={formatTonnage(detail.tonnage)} />
          <DetailField label="차량연식" value={detail.model_year} />
          <DetailField label="차대번호" value={detail.vin} />
          <DetailField label="차량형식" value={detail.vehicle_model_type} />
          <DetailField label="상태" value={detail.status} />
        </DetailFieldGrid>
      </CardContent>
    </Card>
  );
}
