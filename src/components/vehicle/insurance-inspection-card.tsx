import { DetailField, DetailFieldGrid } from "@/components/vehicle/detail-field";
import { DueDateWarningBadge } from "@/components/vehicle/vehicle-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/vehicles/format";
import type { VehicleDetail } from "@/types/vehicle";

export function InsuranceInspectionCard({ detail }: { detail: VehicleDetail }) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>보험 / 점검</CardTitle>
        <div className="flex flex-wrap gap-2">
          <DueDateWarningBadge label="보험갱신" date={detail.insurance_renewal_date} />
          <DueDateWarningBadge label="차량점검" date={detail.latest_inspection_date} />
        </div>
      </CardHeader>
      <CardContent>
        <DetailFieldGrid>
          <DetailField label="보험사명" value={detail.insurance_company} />
          <DetailField
            label="보험요율"
            value={detail.insurance_rate != null ? `${detail.insurance_rate}` : null}
          />
          <DetailField label="보험갱신일" value={formatDate(detail.insurance_renewal_date)} />
          <DetailField label="최근 차량점검일자" value={formatDate(detail.latest_inspection_date)} />
          <DetailField label="점검결과" value={detail.inspection_result} />
          <DetailField label="점검메모" value={detail.inspection_memo} className="sm:col-span-2" />
        </DetailFieldGrid>
      </CardContent>
    </Card>
  );
}
