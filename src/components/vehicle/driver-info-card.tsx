import { DetailField, DetailFieldGrid } from "@/components/vehicle/detail-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/vehicles/format";
import type { VehicleDetail } from "@/types/vehicle";

export function DriverInfoCard({ detail }: { detail: VehicleDetail }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>운전자 정보</CardTitle>
      </CardHeader>
      <CardContent>
        <DetailFieldGrid>
          <DetailField label="운전자명" value={detail.driver_name} />
          <DetailField label="생년월일" value={formatDate(detail.birth_date)} />
          <DetailField label="운전자연락처" value={detail.driver_phone} />
          <DetailField label="운전면허번호" value={detail.driver_license_no} />
          <DetailField label="화물운송종사자격번호" value={detail.cargo_license_no} />
        </DetailFieldGrid>
      </CardContent>
    </Card>
  );
}
