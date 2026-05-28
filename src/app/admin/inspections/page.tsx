import Link from "next/link";

import { AdminDataTableShell, AdminSearchBar } from "@/components/admin/admin-data-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateKo } from "@/lib/format/format-date";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 20;

type PageProps = { searchParams?: Promise<{ page?: string }> };

export default async function AdminInspectionsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp?.page ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();
  const { data: rows, count, error } = await supabase
    .from("vehicle_inspections")
    .select("*", { count: "exact" })
    .order("inspection_date", { ascending: false })
    .range(from, to);
  const vehicleIds = [...new Set((rows ?? []).map((r) => r.vehicle_id))];
  const { data: vehicles } =
    vehicleIds.length > 0
      ? await supabase.from("vehicles").select("id, vehicle_no").in("id", vehicleIds)
      : { data: [] as { id: string; vehicle_no: string | null }[] };
  const vehicleById = new Map((vehicles ?? []).map((v) => [v.id, v.vehicle_no ?? "—"]));

  if (error) {
    return <p className="text-sm text-red-600">목록을 불러오지 못했습니다.</p>;
  }

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <AdminPageHeader title="점검 관리" description="차량 점검 이력을 관리합니다." />
      <AdminDataTableShell
        toolbar={
          <>
            <AdminSearchBar placeholder="검색…" />
            <Button asChild>
              <Link href="/admin/inspections/new">등록</Link>
            </Button>
          </>
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>차량번호</TableHead>
              <TableHead>점검일</TableHead>
              <TableHead>유형</TableHead>
              <TableHead>결과</TableHead>
              <TableHead className="w-28" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {(rows ?? []).map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <Link href={`/vehicles/${row.vehicle_id}`} className="text-blue-600 hover:underline">
                    {vehicleById.get(row.vehicle_id) ?? "—"}
                  </Link>
                </TableCell>
                <TableCell>{formatDateKo(row.inspection_date)}</TableCell>
                <TableCell>{row.inspection_type ?? "—"}</TableCell>
                <TableCell>{row.result ?? "—"}</TableCell>
                <TableCell>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/inspections/${row.id}/edit`}>수정</Link>
                  </Button>
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
                <Link href={`/admin/inspections?page=${page - 1}`}>이전</Link>
              </Button>
            ) : null}
            {page < totalPages ? (
              <Button asChild size="sm" variant="outline">
                <Link href={`/admin/inspections?page=${page + 1}`}>다음</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </AdminDataTableShell>
    </div>
  );
}
