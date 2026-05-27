import { DetailField, DetailFieldGrid } from "@/components/vehicle/detail-field";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/vehicles/format";
import type { VehicleDetail } from "@/types/vehicle";

export function ContractOwnerCard({ detail }: { detail: VehicleDetail }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>계약 / 사업자 정보</CardTitle>
      </CardHeader>
      <CardContent>
        <DetailFieldGrid>
          <DetailField label="위수탁계약일" value={formatDate(detail.consignment_contract_date)} />
          <DetailField label="차량용역계약일" value={formatDate(detail.service_contract_date)} />
          <DetailField label="사업자등록일" value={formatDate(detail.business_start_date)} />
          <DetailField label="위수탁계약해지일" value={formatDate(detail.consignment_contract_end_date)} />
          <DetailField label="차량용역계약해지일" value={formatDate(detail.service_contract_end_date)} />
          <DetailField label="사업자폐업일" value={formatDate(detail.business_closed_date)} />
          <DetailField label="사업주명" value={detail.owner_name} />
          <DetailField label="사업주연락처" value={detail.owner_phone} />
          <DetailField label="용역비발송방법" value={detail.service_fee_send_method} />
          <div className="space-y-1">
            <dt className="text-xs font-medium text-slate-500">부가세신고여부</dt>
            <dd>
              {detail.vat_filing_enabled == null ? (
                <span className="text-sm font-medium text-slate-900">-</span>
              ) : (
                <Badge variant={detail.vat_filing_enabled ? "success" : "secondary"}>
                  {detail.vat_filing_enabled ? "신고" : "미신고"}
                </Badge>
              )}
            </dd>
          </div>
        </DetailFieldGrid>
      </CardContent>
    </Card>
  );
}
