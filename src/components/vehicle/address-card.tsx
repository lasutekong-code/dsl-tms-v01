import { DetailField, DetailFieldGrid } from "@/components/vehicle/detail-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { VehicleDetail } from "@/types/vehicle";

export function AddressCard({ detail }: { detail: VehicleDetail }) {
  if (!detail.can_view_sensitive) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>주소</CardTitle>
      </CardHeader>
      <CardContent>
        <DetailFieldGrid>
          <DetailField label="집주소" value={detail.home_address} className="sm:col-span-2" />
          <DetailField label="우편물발송주소" value={detail.mailing_address} className="sm:col-span-2" />
        </DetailFieldGrid>
      </CardContent>
    </Card>
  );
}
