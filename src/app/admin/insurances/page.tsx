import Link from "next/link";

import { AdminListActions } from "@/components/admin/admin-list-actions";
import { AdminDataTableShell, AdminSearchBar } from "@/components/admin/admin-data-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateKo } from "@/lib/format/format-date";
import { decryptPii } from "@/lib/crypto/pii";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 20;

type PageProps = { searchParams?: Promise<{ page?: string }> };

export default async function AdminInsurancesPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp?.page ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();
  const { data: rows, count, error } = await supabase
    .from("insurances")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
  const vehicleIds = [...new Set((rows ?? []).map((r) => r.vehicle_id))];
  const [{ data: vehicles }, { data: assignments }, { data: drivers }] = await Promise.all([
    vehicleIds.length > 0
      ? supabase.from("vehicles").select("id, vehicle_no").in("id", vehicleIds)
      : Promise.resolve({ data: [] as { id: string; vehicle_no: string | null }[] }),
    vehicleIds.length > 0
      ? supabase.from("vehicle_assignments").select("vehicle_id, driver_id").in("vehicle_id", vehicleIds).eq("is_current", true)
      : Promise.resolve({ data: [] as { vehicle_id: string; driver_id: string }[] }),
    supabase.from("drivers").select("id, driver_name"),
  ]);
  const vehicleById = new Map((vehicles ?? []).map((v) => [v.id, v.vehicle_no ?? "—"]));
  const driverById = new Map(
    (drivers ?? []).map((d) => [d.id, decryptPii(d.driver_name) ?? d.driver_name ?? "—"]),
  );
  const driverNamesByVehicle = new Map<string, string>();
  for (const row of assignments ?? []) {
    const prev = driverNamesByVehicle.get(row.vehicle_id);
    const name = driverById.get(row.driver_id) ?? "—";
    driverNamesByVehicle.set(row.vehicle_id, prev ? `${prev}, ${name}` : name);
  }

  if (error) {
    return <p className="text-sm text-red-600">목록을 불러오지 못했습니다.</p>;
  }

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <AdminPageHeader title="보험 관리" description="차량별 보험 정보를 관리합니다." />
      <AdminDataTableShell
        toolbar={
          <>
            <AdminSearchBar placeholder="검색…" />
            <Button asChild>
              <Link href="/admin/insurances/new">등록</Link>
            </Button>
          </>
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>차량번호</TableHead>
              <TableHead>운전자명</TableHead>
              <TableHead>보험사</TableHead>
              <TableHead>갱신일</TableHead>
              <TableHead>등록일</TableHead>
              <TableHead className="w-36" />
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
                <TableCell>{driverNamesByVehicle.get(row.vehicle_id) ?? "—"}</TableCell>
                <TableCell>{row.insurance_company ?? "—"}</TableCell>
                <TableCell>{row.renewal_date ? formatDateKo(row.renewal_date) : "—"}</TableCell>
                <TableCell className="text-slate-600">{formatDateKo(row.created_at ?? null)}</TableCell>
                <TableCell>
                  <AdminListActions
                    viewHref={`/admin/insurances/${row.id}`}
                    editHref={`/admin/insurances/${row.id}/edit`}
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
                <Link href={`/admin/insurances?page=${page - 1}`}>이전</Link>
              </Button>
            ) : null}
            {page < totalPages ? (
              <Button asChild size="sm" variant="outline">
                <Link href={`/admin/insurances?page=${page + 1}`}>다음</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </AdminDataTableShell>
    </div>
  );
}
