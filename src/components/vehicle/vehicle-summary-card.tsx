import { DetailField, DetailFieldGrid } from "@/components/vehicle/detail-field";
import { VehicleStatusBadge } from "@/components/vehicle/vehicle-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { VehicleDetail } from "@/types/vehicle";

export function VehicleSummaryCard({ detail }: { detail: VehicleDetail }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>차량 요약</CardTitle>
        <VehicleStatusBadge status={detail.status} />
      </CardHeader>
      <CardContent>
        <DetailFieldGrid>
          <DetailField label="차량번호" value={detail.vehicle_no} />
          <DetailField label="차명" value={detail.car_name} />
          <DetailField label="차량상태" value={detail.status} />
          <DetailField label="거래처명" value={detail.client_name} />
          <DetailField label="센터명" value={detail.center_name} />
          <DetailField label="운전자명" value={detail.driver_name} />
          <DetailField label="사업주명" value={detail.owner_name} />
        </DetailFieldGrid>
      </CardContent>
    </Card>
  );
}
