import { DetailField, DetailFieldGrid } from "@/components/vehicle/detail-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { VehicleDetail } from "@/types/vehicle";

export function ClientCenterCard({ detail }: { detail: VehicleDetail }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>거래처 / 센터 / 담당자</CardTitle>
      </CardHeader>
      <CardContent>
        <DetailFieldGrid>
          <DetailField label="거래처명" value={detail.client_name} />
          <DetailField label="센터명" value={detail.center_name} />
          <DetailField label="담당자명" value={detail.contact_name} />
          <DetailField label="담당자연락처" value={detail.contact_phone} />
        </DetailFieldGrid>
      </CardContent>
    </Card>
  );
}
