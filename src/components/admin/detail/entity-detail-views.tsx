import Link from "next/link";

import { AdminRecordMeta } from "@/components/admin/admin-record-meta";
import { AdminVehiclePhotosPanel } from "@/components/admin/admin-vehicle-photos-panel";
import { DriverPhotoThumb } from "@/components/admin/driver-photo-thumb";
import { AdminDetailFooter } from "@/components/admin/detail/detail-footer";
import { DetailField, DetailFieldGrid } from "@/components/admin/detail/detail-field";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSectionCard } from "@/components/admin/admin-section-card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateKo } from "@/lib/format/format-date";
import { CONTRACT_STATUSES, CONTRACT_TYPES, VEHICLE_STATUS_LABELS } from "@/types/admin";
import type {
  ClientContactRow,
  ClientRow,
  CenterRow,
  ContractRow,
  DriverRow,
  InsuranceRow,
  OwnerRow,
  VehicleAssignmentRow,
  VehicleInspectionRow,
  VehicleRow,
  VehicleSpecRow,
} from "@/types/database";

function yesNo(value: boolean | null | undefined) {
  if (value === true) return "예";
  if (value === false) return "아니오";
  return "—";
}

function contractTypeLabel(value: string) {
  return CONTRACT_TYPES.find((t) => t.value === value)?.label ?? value;
}

function contractStatusLabel(value: string) {
  return CONTRACT_STATUSES.find((s) => s.value === value)?.label ?? value;
}

export function ClientDetailView({ data }: { data: ClientRow }) {
  return (
    <div className="space-y-6">
      <AdminPageHeader title="거래처 조회" description={data.client_name} />
      <AdminRecordMeta updatedAt={data.updated_at} targetTable="clients" targetId={data.id} />
      <AdminSectionCard title="기본 정보" sectionId="sec-client-view">
        <DetailFieldGrid>
          <DetailField label="거래처명" value={data.client_name} />
          <DetailField label="사업자등록번호" value={data.business_no} />
          <DetailField label="대표 전화" value={data.main_phone} />
          <DetailField label="활성" value={yesNo(data.is_active)} />
          <DetailField label="주소" value={data.address} fullWidth />
        </DetailFieldGrid>
      </AdminSectionCard>
      <AdminDetailFooter listHref="/admin/clients" editHref={`/admin/clients/${data.id}/edit`} />
    </div>
  );
}

export function CenterDetailView({ data, clientName }: { data: CenterRow; clientName: string }) {
  return (
    <div className="space-y-6">
      <AdminPageHeader title="센터 조회" description={data.center_name} />
      <AdminRecordMeta updatedAt={data.updated_at} targetTable="centers" targetId={data.id} />
      <AdminSectionCard title="센터 정보" sectionId="sec-center-view">
        <DetailFieldGrid>
          <DetailField label="센터명" value={data.center_name} />
          <DetailField label="거래처" value={clientName} />
          <DetailField label="전화" value={data.phone} />
          <DetailField label="활성" value={yesNo(data.is_active)} />
          <DetailField label="주소" value={data.address} fullWidth />
        </DetailFieldGrid>
      </AdminSectionCard>
      <AdminDetailFooter listHref="/admin/centers" editHref={`/admin/centers/${data.id}/edit`} />
    </div>
  );
}

export function ClientContactDetailView({
  data,
  clientName,
  centerName,
}: {
  data: ClientContactRow;
  clientName: string;
  centerName: string | null;
}) {
  return (
    <div className="space-y-6">
      <AdminPageHeader title="담당자 조회" description={data.contact_name} />
      <AdminRecordMeta updatedAt={data.updated_at} targetTable="client_contacts" targetId={data.id} />
      <AdminSectionCard title="담당자 정보" sectionId="sec-contact-view">
        <DetailFieldGrid>
          <DetailField label="담당자명" value={data.contact_name} />
          <DetailField label="거래처" value={clientName} />
          <DetailField label="센터" value={centerName} />
          <DetailField label="전화" value={data.phone} />
          <DetailField label="이메일" value={data.email} />
          <DetailField label="활성" value={yesNo(data.is_active)} />
        </DetailFieldGrid>
      </AdminSectionCard>
      <AdminDetailFooter listHref="/admin/client-contacts" editHref={`/admin/client-contacts/${data.id}/edit`} />
    </div>
  );
}

export function DriverDetailView({
  data,
  photoStoragePath,
}: {
  data: DriverRow;
  photoStoragePath: string | null;
}) {
  return (
    <div className="space-y-6">
      <AdminPageHeader title="운전자 조회" description={data.driver_name} />
      <AdminRecordMeta updatedAt={data.updated_at} targetTable="drivers" targetId={data.id} />
      <AdminSectionCard title="기본 정보" sectionId="sec-driver-view">
        <div className="mb-4 flex flex-wrap items-start gap-4">
          <DriverPhotoThumb driverName={data.driver_name} storagePath={photoStoragePath} />
          <div className="min-w-[200px] flex-1">
            <DetailFieldGrid>
              <DetailField label="운전자명" value={data.driver_name} />
              <DetailField label="전화번호" value={data.phone} />
            </DetailFieldGrid>
          </div>
        </div>
        <DetailFieldGrid>
          <DetailField label="생년월일" value={data.birth_date ? formatDateKo(data.birth_date) : "—"} />
          <DetailField label="운전면허 번호" value={data.driver_license_no} />
          <DetailField label="화물운송종사자격번호" value={data.cargo_license_no} />
          <DetailField label="프로필 ID" value={data.profile_id} />
          <DetailField label="활성" value={yesNo(data.is_active)} />
        </DetailFieldGrid>
      </AdminSectionCard>
      <div className="flex flex-wrap gap-3 text-sm">
        <Link href={`/admin/drivers/${data.id}/edit#driver-addresses`} className="text-blue-600 hover:underline">
          주소·메모 보기
        </Link>
        <Link href={`/admin/drivers/${data.id}/photo`} className="text-blue-600 hover:underline">
          사진 관리
        </Link>
      </div>
      <AdminDetailFooter listHref="/admin/drivers" editHref={`/admin/drivers/${data.id}/edit`} />
    </div>
  );
}

export function OwnerDetailView({ data }: { data: OwnerRow }) {
  return (
    <div className="space-y-6">
      <AdminPageHeader title="사업주 조회" description={data.owner_name ?? ""} />
      <AdminRecordMeta updatedAt={data.updated_at} targetTable="owners" targetId={data.id} />
      <AdminSectionCard title="기본 정보" sectionId="sec-owner-view">
        <DetailFieldGrid>
          <DetailField label="사업주명" value={data.owner_name} />
          <DetailField label="전화번호" value={data.owner_phone} />
          <DetailField label="사업자등록번호" value={data.business_no} />
          <DetailField label="사업 시작일" value={data.business_start_date ? formatDateKo(data.business_start_date) : "—"} />
          <DetailField label="사업 종료일" value={data.business_closed_date ? formatDateKo(data.business_closed_date) : "—"} />
          <DetailField label="안내문 발송 방식" value={data.service_fee_send_method} />
          <DetailField label="프로필 ID" value={data.profile_id} />
          <DetailField label="부가세 신고" value={yesNo(data.vat_filing_enabled)} />
          <DetailField label="활성" value={yesNo(data.is_active)} />
        </DetailFieldGrid>
      </AdminSectionCard>
      <AdminDetailFooter listHref="/admin/owners" editHref={`/admin/owners/${data.id}/edit`} />
    </div>
  );
}

export function VehicleDetailView({
  data,
  spec,
  photos,
}: {
  data: VehicleRow;
  spec: Partial<VehicleSpecRow> | null;
  photos: { photo_type: string; storage_path: string }[];
}) {
  return (
    <div className="space-y-6">
      <AdminPageHeader title="차량 조회" description={data.vehicle_no} />
      <AdminRecordMeta updatedAt={data.updated_at} targetTable="vehicles" targetId={data.id} />
      <AdminSectionCard title="차량 기본정보" sectionId="sec-vehicle-view">
        <DetailFieldGrid>
          <DetailField label="차량번호" value={data.vehicle_no} />
          <DetailField label="차명" value={data.car_name} />
          <DetailField label="등록일" value={data.registration_date ? formatDateKo(data.registration_date) : "—"} />
          <DetailField label="연식" value={data.model_year} />
          <DetailField label="차대번호" value={data.vin} />
          <DetailField label="차종" value={data.vehicle_model_type} />
          <DetailField label="특장(일반/냉동/냉장)" value={spec?.special_equipment} />
          <DetailField label="톤수" value={data.tonnage} />
          <DetailField label="제원 길이(mm)" value={spec?.length_mm} />
          <DetailField label="제원 너비(mm)" value={spec?.width_mm} />
          <DetailField label="제원 높이(mm)" value={spec?.height_mm} />
          <DetailField label="최대적재량(kg)" value={spec?.max_load_kg} />
          <DetailField label="상태" value={VEHICLE_STATUS_LABELS[data.status ?? ""] ?? data.status} />
        </DetailFieldGrid>
      </AdminSectionCard>
      <AdminVehiclePhotosPanel photos={photos} />
      <AdminDetailFooter listHref="/admin/vehicles" editHref={`/admin/vehicles/${data.id}/edit`} />
    </div>
  );
}

export function AssignmentDetailView({
  data,
  vehicleNo,
  driverName,
  clientName,
  centerName,
  ownerName,
}: {
  data: VehicleAssignmentRow;
  vehicleNo: string;
  driverName: string;
  clientName: string;
  centerName: string;
  ownerName: string;
}) {
  return (
    <div className="space-y-6">
      <AdminPageHeader title="차량 배정 조회" description={vehicleNo} />
      <AdminRecordMeta updatedAt={data.updated_at} targetTable="vehicle_assignments" targetId={data.id} />
      <AdminSectionCard title="배정" sectionId="sec-assignment-view">
        <DetailFieldGrid>
          <DetailField label="차량번호" value={vehicleNo} />
          <DetailField label="거래처" value={clientName} />
          <DetailField label="센터" value={centerName} />
          <DetailField label="운전자" value={driverName} />
          <DetailField label="사업주" value={ownerName} />
          <DetailField label="운행시간" value={data.operation_time} />
          <DetailField label="담당자명" value={data.manager_name} />
          <DetailField label="시작일" value={formatDateKo(data.start_date)} />
          <DetailField label="종료일" value={data.end_date ? formatDateKo(data.end_date) : "—"} />
          <DetailField label="현재 배정" value={yesNo(data.is_current)} />
        </DetailFieldGrid>
      </AdminSectionCard>
      <AdminDetailFooter listHref="/admin/assignments" editHref={`/admin/assignments/${data.id}/edit`} />
    </div>
  );
}

export function InsuranceDetailView({ data, vehicleNo }: { data: InsuranceRow; vehicleNo: string }) {
  return (
    <div className="space-y-6">
      <AdminPageHeader title="보험 조회" description={vehicleNo} />
      <AdminRecordMeta updatedAt={data.updated_at} targetTable="insurances" targetId={data.id} />
      <AdminSectionCard title="보험" sectionId="sec-insurance-view">
        <DetailFieldGrid>
          <DetailField label="차량번호" value={vehicleNo} />
          <DetailField label="보험사" value={data.insurance_company} />
          <DetailField label="보험요율" value={data.insurance_rate_text ?? data.insurance_rate} />
          <DetailField label="갱신일" value={data.renewal_date ? formatDateKo(data.renewal_date) : "—"} />
          <DetailField label="메모" value={data.memo} fullWidth />
        </DetailFieldGrid>
      </AdminSectionCard>
      <AdminDetailFooter listHref="/admin/insurances" editHref={`/admin/insurances/${data.id}/edit`} />
    </div>
  );
}

export function InspectionDetailView({
  data,
  vehicleNo,
  history,
}: {
  data: VehicleInspectionRow;
  vehicleNo: string;
  history: VehicleInspectionRow[];
}) {
  return (
    <div className="space-y-6">
      <AdminPageHeader title="점검 조회" description={vehicleNo} />
      <AdminRecordMeta
        updatedAt={data.updated_at}
        targetTable="vehicle_inspections"
        targetId={data.id}
      />
      <AdminSectionCard title="점검" sectionId="sec-inspection-view">
        <DetailFieldGrid>
          <DetailField label="차량번호" value={vehicleNo} />
          <DetailField label="점검일" value={formatDateKo(data.inspection_date)} />
          <DetailField label="점검 유형" value={data.inspection_type} />
          <DetailField label="검사소명" value={data.inspection_station_name} />
          <DetailField label="결과" value={data.result} />
          <DetailField label="메모" value={data.memo} fullWidth />
        </DetailFieldGrid>
      </AdminSectionCard>
      <AdminSectionCard title="차량점검 이력" sectionId="sec-inspection-history">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>점검일</TableHead>
              <TableHead>점검유형</TableHead>
              <TableHead>검사소</TableHead>
              <TableHead>결과</TableHead>
              <TableHead>메모</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-slate-500">
                  이력이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              history.map((row) => (
                <TableRow key={row.id} className={row.id === data.id ? "bg-sky-50/60" : undefined}>
                  <TableCell>{formatDateKo(row.inspection_date)}</TableCell>
                  <TableCell>{row.inspection_type ?? "—"}</TableCell>
                  <TableCell>{row.inspection_station_name ?? "—"}</TableCell>
                  <TableCell>{row.result ?? "—"}</TableCell>
                  <TableCell>{row.memo ?? "—"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </AdminSectionCard>
      <AdminDetailFooter listHref="/admin/inspections" editHref={`/admin/inspections/${data.id}/edit`} />
    </div>
  );
}

export function ContractDetailView({
  data,
  vehicleNo,
  ownerName,
  clientName,
}: {
  data: ContractRow;
  vehicleNo: string;
  ownerName: string;
  clientName: string;
}) {
  return (
    <div className="space-y-6">
      <AdminPageHeader title="계약 조회" description={contractTypeLabel(data.contract_type)} />
      <AdminRecordMeta updatedAt={data.updated_at} targetTable="contracts" targetId={data.id} />
      <AdminSectionCard title="계약 정보" sectionId="sec-contract-view">
        <DetailFieldGrid>
          <DetailField label="계약 유형" value={contractTypeLabel(data.contract_type)} />
          <DetailField label="차량번호" value={vehicleNo} />
          <DetailField label="사업주" value={ownerName} />
          <DetailField label="거래처" value={clientName} />
          <DetailField label="시작일" value={formatDateKo(data.contract_start_date)} />
          <DetailField label="종료일" value={data.contract_end_date ? formatDateKo(data.contract_end_date) : "—"} />
          <DetailField
            label="상태"
            value={<Badge variant="secondary">{contractStatusLabel(data.status)}</Badge>}
          />
          <DetailField label="메모" value={data.memo} fullWidth />
          <DetailField label="계약서 파일" value={data.contract_file_name ?? "—"} fullWidth />
        </DetailFieldGrid>
      </AdminSectionCard>
      <AdminDetailFooter listHref="/admin/contracts" editHref={`/admin/contracts/${data.id}/edit`} />
    </div>
  );
}
