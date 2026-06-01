export const dynamic = "force-dynamic";

import Link from "next/link";

import { AdminListActions } from "@/components/admin/admin-list-actions";
import { AdminRegisterButton } from "@/components/admin/admin-register-button";
import { AdminVehicleDetailLink } from "@/components/admin/admin-vehicle-detail-link";
import { AdminDataTableShell, AdminSearchBar } from "@/components/admin/admin-data-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateKo } from "@/lib/format/format-date";
import { decryptOwnerRow } from "@/lib/admin/pii-transform";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 20;

type PageProps = { searchParams?: Promise<{ q?: string; page?: string }> };

export default async function AdminOwnersListPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const q = sp?.q?.trim() ?? "";
  const page = Math.max(1, Number.parseInt(sp?.page ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();
  let query = supabase.from("owners").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(from, to);
  if (q) {
    query = query.ilike("owner_name", `%${q}%`);
  }

  const { data: rawRows, count, error } = await query;
  const rows = (rawRows ?? []).map(decryptOwnerRow);
  const ownerIds = rows.map((row) => row.id);
  const { data: assignments } =
    ownerIds.length > 0
      ? await supabase
          .from("vehicle_assignments")
          .select("owner_id, vehicle_id")
          .in("owner_id", ownerIds)
          .eq("is_current", true)
      : { data: [] as { owner_id: string; vehicle_id: string }[] };
  const vehicleIdByOwner = new Map((assignments ?? []).map((row) => [row.owner_id, row.vehicle_id]));

  if (error) {
    return <p className="text-sm text-red-600">목록을 불러오지 못했습니다.</p>;
  }

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <AdminPageHeader title="사업주 관리" description="사업주 정보를 관리합니다." />
      <AdminDataTableShell
        toolbar={
          <>
            <AdminSearchBar defaultValue={q} />
            <AdminRegisterButton href="/admin/owners/new" />
          </>
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>사업주명</TableHead>
              <TableHead>전화</TableHead>
              <TableHead>사업자번호</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>등록일</TableHead>
              <TableHead className="w-36" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {(rows ?? []).map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <AdminVehicleDetailLink vehicleId={vehicleIdByOwner.get(row.id)}>
                    {row.owner_name}
                  </AdminVehicleDetailLink>
                </TableCell>
                <TableCell>{row.owner_phone ?? "—"}</TableCell>
                <TableCell>{row.business_no ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={row.is_active ? "success" : "outline"}>{row.is_active ? "활성" : "비활성"}</Badge>
                </TableCell>
                <TableCell className="text-slate-600">{formatDateKo(row.created_at ?? null)}</TableCell>
                <TableCell>
                  <AdminListActions viewHref={`/admin/owners/${row.id}`} editHref={`/admin/owners/${row.id}/edit`} />
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
                <Link href={`/admin/owners?page=${page - 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`}>이전</Link>
              </Button>
            ) : null}
            {page < totalPages ? (
              <Button asChild size="sm" variant="outline">
                <Link href={`/admin/owners?page=${page + 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`}>다음</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </AdminDataTableShell>
    </div>
  );
}
