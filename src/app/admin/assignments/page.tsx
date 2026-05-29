import Link from "next/link";

import { AdminEntityLink } from "@/components/admin/admin-entity-link";
import { AdminListActions } from "@/components/admin/admin-list-actions";
import { AdminDataTableShell, AdminSearchBar } from "@/components/admin/admin-data-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateKo } from "@/lib/format/format-date";
import { decryptPii } from "@/lib/crypto/pii";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 20;

type PageProps = { searchParams?: Promise<{ page?: string }> };

export default async function AdminAssignmentsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp?.page ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();
  const { data: rows, count, error } = await supabase
    .from("vehicle_assignments")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
  const vehicleIds = [...new Set((rows ?? []).map((r) => r.vehicle_id))];
  const driverIds = [...new Set((rows ?? []).map((r) => r.driver_id))];
  const clientIds = [...new Set((rows ?? []).map((r) => r.client_id))];
  const [{ data: vehicles }, { data: drivers }, { data: clients }] = await Promise.all([
    vehicleIds.length > 0
      ? supabase.from("vehicles").select("id, vehicle_no").in("id", vehicleIds)
      : Promise.resolve({ data: [] as { id: string; vehicle_no: string | null }[] }),
    driverIds.length > 0
      ? supabase.from("drivers").select("id, driver_name").in("id", driverIds)
      : Promise.resolve({ data: [] as { id: string; driver_name: string | null }[] }),
    clientIds.length > 0
      ? supabase.from("clients").select("id, client_name").in("id", clientIds)
      : Promise.resolve({ data: [] as { id: string; client_name: string | null }[] }),
  ]);
  const vehicleById = new Map((vehicles ?? []).map((v) => [v.id, v.vehicle_no ?? "—"]));
  const driverById = new Map(
    (drivers ?? []).map((d) => [d.id, decryptPii(d.driver_name) ?? d.driver_name ?? "—"]),
  );
  const clientById = new Map((clients ?? []).map((c) => [c.id, c.client_name ?? "—"]));

  if (error) {
    return <p className="text-sm text-red-600">목록을 불러오지 못했습니다.</p>;
  }

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <AdminPageHeader title="차량 배정" description="차량·거래처·센터·운전자·사업주 배정을 관리합니다." />
      <AdminDataTableShell
        toolbar={
          <>
            <AdminSearchBar placeholder="검색(차량번호 등)…" name="q" defaultValue="" />
            <Button asChild>
              <Link href="/admin/assignments/new">등록</Link>
            </Button>
          </>
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>차량번호</TableHead>
              <TableHead>운전자</TableHead>
              <TableHead>거래처</TableHead>
              <TableHead>운행시간</TableHead>
              <TableHead>담당자명</TableHead>
              <TableHead>시작일</TableHead>
              <TableHead>종료일</TableHead>
              <TableHead>현재</TableHead>
              <TableHead>등록일</TableHead>
              <TableHead className="w-36" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {(rows ?? []).map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <AdminEntityLink href={`/admin/assignments/${row.id}`}>
                    {vehicleById.get(row.vehicle_id) ?? "—"}
                  </AdminEntityLink>
                </TableCell>
                <TableCell>{driverById.get(row.driver_id) ?? "—"}</TableCell>
                <TableCell>{clientById.get(row.client_id) ?? "—"}</TableCell>
                <TableCell>{row.operation_time || "—"}</TableCell>
                <TableCell>{row.manager_name || "—"}</TableCell>
                <TableCell>{formatDateKo(row.start_date)}</TableCell>
                <TableCell>{row.end_date ? formatDateKo(row.end_date) : "—"}</TableCell>
                <TableCell>
                  <Badge variant={row.is_current ? "success" : "outline"}>{row.is_current ? "예" : "아니오"}</Badge>
                </TableCell>
                <TableCell className="text-slate-600">{formatDateKo(row.created_at ?? null)}</TableCell>
                <TableCell>
                  <AdminListActions
                    viewHref={`/admin/assignments/${row.id}`}
                    editHref={`/admin/assignments/${row.id}/edit`}
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
                <Link href={`/admin/assignments?page=${page - 1}`}>이전</Link>
              </Button>
            ) : null}
            {page < totalPages ? (
              <Button asChild size="sm" variant="outline">
                <Link href={`/admin/assignments?page=${page + 1}`}>다음</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </AdminDataTableShell>
    </div>
  );
}
