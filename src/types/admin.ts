/** Shared admin UI / API option types */

export const CONTRACT_TYPES = [
  { value: "consignment", label: "위수탁계약" },
  { value: "service", label: "차량용역계약" },
] as const;

export const CONTRACT_STATUSES = [
  { value: "active", label: "진행중" },
  { value: "terminated", label: "해지" },
  { value: "expired", label: "만료" },
] as const;

export const ADDRESS_TYPES = [
  { value: "home", label: "자택" },
  { value: "mailing", label: "우편" },
] as const;

export const MEMO_VISIBILITY_OPTIONS = [
  { value: "admin_only", label: "관리자 전용" },
  { value: "internal", label: "내부" },
  { value: "shared", label: "공유" },
] as const;

export const VEHICLE_PHOTO_TYPES = [
  { value: "front", label: "전면" },
  { value: "rear", label: "후면" },
  { value: "side", label: "측면" },
] as const;

export type ContractTypeValue = (typeof CONTRACT_TYPES)[number]["value"];
export type ContractStatusValue = (typeof CONTRACT_STATUSES)[number]["value"];

export type AdminListPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type FieldErrors = Record<string, string[] | undefined>;
