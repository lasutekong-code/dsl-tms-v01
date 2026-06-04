import Link from "next/link";

import { AdminRegisterButton } from "@/components/admin/admin-register-button";
import { AdminVehicleDetailLink } from "@/components/admin/admin-vehicle-detail-link";
import { AdminEntityLink } from "@/components/admin/admin-entity-link";
import { AdminListActions } from "@/components/admin/admin-list-actions";
import { AdminDataTableShell, AdminSearchBar } from "@/components/admin/admin-data-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateKo } from "@/lib/format/format-date";
import { decryptPii } from "@/lib/crypto/pii";
import {
  adminListPageHref,
  buildIlikeFilter,
  buildInFilter,
  findClientIdsByName,
  findOwnerIdsByName,
  findVehicleIdsByNo,
} from "@/lib/admin/list-page-search";
import { createClient } from "@/lib/supabase/server";
import { CONTRACT_TYPES } from "@/types/admin";

const PAGE_SIZE = 20;

type PageProps = { searchParams?: Promise<{ q?: string; page?: string }> };

export default async function AdminContractsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const q = sp?.q?.trim() ?? "";
  const page = Math.max(1, Number.parseInt(sp?.page ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();
  let query = supabase.from("contracts").select("*", { count: "exact" }).order("created_at", { ascending: false });

  if (q) {
    const [vehicleIds, ownerIds, clientIds] = await Promise.all([
      findVehicleIdsByNo(supabase, q),
      findOwnerIdsByName(supabase, q),
      findClientIdsByName(supabase, q),
    ]);
    const matchingContractTypes = CONTRACT_TYPES.filter((type) => type.label.includes(q)).map((type) => type.value);
    const orParts = [
      buildInFilter("vehicle_id", vehicleIds),
      buildInFilter("owner_id", ownerIds),
      buildInFilter("client_id", clientIds),
      buildInFilter("contract_type", matchingContractTypes),
      buildIlikeFilter("status", q),
    ].filter((part): part is string => part != null);
    query = query.or(orParts.join(","));
  }

  const { data: rows, count, error } = await query.range(from, to);
  const vehicleIds = [...new Set((rows ?? []).map((r) => r.vehicle_id))];
  const ownerIds = [...new Set((rows ?? []).map((r) => r.owner_id))];
  const clientIds = [...new Set((rows ?? []).map((r) => r.client_id))];
  const [{ data: vehicles }, { data: owners }, { data: clients }] = await Promise.all([
    vehicleIds.length > 0
      ? supabase.from("vehicles").select("id, vehicle_no").in("id", vehicleIds)
      : Promise.resolve({ data: [] as { id: string; vehicle_no: string | null }[] }),
    ownerIds.length > 0
      ? supabase.from("owners").select("id, owner_name").in("id", ownerIds)
      : Promise.resolve({ data: [] as { id: string; owner_name: string | null }[] }),
    clientIds.length > 0
      ? supabase.from("clients").select("id, client_name").in("id", clientIds)
      : Promise.resolve({ data: [] as { id: string; client_name: string | null }[] }),
  ]);
  const vehicleById = new Map((vehicles ?? []).map((v) => [v.id, v.vehicle_no ?? "—"]));
  const ownerById = new Map(
    (owners ?? []).map((o) => [o.id, decryptPii(o.owner_name) ?? o.owner_name ?? "—"]),
  );
  const clientById = new Map((clients ?? []).map((c) => [c.id, c.client_name ?? "—"]));
  const contractTypeLabel = (value: string) => CONTRACT_TYPES.find((t) => t.value === value)?.label ?? value;

  if (error) {
    return <p className="text-sm text-red-600">목록을 불러오지 못했습니다.</p>;
  }

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const listReturnHref = adminListPageHref("/admin/contracts", page, q);

  return (
    <div className="space-y-6">
      <AdminPageHeader title="계약 관리" description="차량·사업주·거래처 계약을 관리합니다." />
      <AdminDataTableShell
        toolbar={
          <>
            <AdminSearchBar placeholder="검색(차량번호, 사업주, 거래처, 계약유형 등)…" defaultValue={q} />
            <AdminRegisterButton href="/admin/contracts/new" />
          </>
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>계약유형</TableHead>
              <TableHead>사업주</TableHead>
              <TableHead>거래처</TableHead>
              <TableHead>차량번호</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>시작일</TableHead>
              <TableHead>종료일</TableHead>
              <TableHead>등록일</TableHead>
              <TableHead className="w-36" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {(rows ?? []).map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <AdminEntityLink href={`/admin/contracts/${row.id}`}>
                    {contractTypeLabel(row.contract_type)}
                  </AdminEntityLink>
                </TableCell>
                <TableCell>{ownerById.get(row.owner_id) ?? "—"}</TableCell>
                <TableCell>{clientById.get(row.client_id) ?? "—"}</TableCell>
                <TableCell>
                  <AdminVehicleDetailLink vehicleId={row.vehicle_id} returnTo={listReturnHref}>
                    {vehicleById.get(row.vehicle_id) ?? "—"}
                  </AdminVehicleDetailLink>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{row.status}</Badge>
                </TableCell>
                <TableCell>{formatDateKo(row.contract_start_date)}</TableCell>
                <TableCell>{row.contract_end_date ? formatDateKo(row.contract_end_date) : "—"}</TableCell>
                <TableCell className="text-slate-600">{formatDateKo(row.created_at ?? null)}</TableCell>
                <TableCell>
                  <AdminListActions
                    viewHref={`/admin/contracts/${row.id}`}
                    editHref={`/admin/contracts/${row.id}/edit`}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>
            총 {total}건 · {page}/{totalPages} 페이지
          </span>
          <div className="flex gap-2">
            {page > 1 ? (
              <Button asChild size="sm" variant="outline">
                <Link href={adminListPageHref("/admin/contracts", page - 1, q)}>이전</Link>
              </Button>
            ) : null}
            {page < totalPages ? (
              <Button asChild size="sm" variant="outline">
                <Link href={adminListPageHref("/admin/contracts", page + 1, q)}>다음</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </AdminDataTableShell>
    </div>
  );
}
