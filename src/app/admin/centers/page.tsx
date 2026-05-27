import Link from "next/link";

import { AdminDataTableShell, AdminSearchBar } from "@/components/admin/admin-data-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateKo } from "@/lib/format/format-date";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 20;

type PageProps = {
  searchParams?: Promise<{ q?: string; page?: string }>;
};

export default async function AdminCentersListPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const q = sp?.q?.trim() ?? "";
  const page = Math.max(1, Number.parseInt(sp?.page ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();
  const [{ data: rows, count, error }, { data: clientRows }] = await Promise.all([
    (() => {
      let query = supabase
        .from("centers")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);
      if (q) {
        query = query.ilike("center_name", `%${q}%`);
      }

      return query;
    })(),
    supabase.from("clients").select("id, client_name"),
  ]);

  const clientMap = new Map((clientRows ?? []).map((c) => [c.id, c.client_name]));

  if (error) {
    return <p className="text-sm text-red-600">목록을 불러오지 못했습니다.</p>;
  }

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <AdminPageHeader title="센터 관리" description="거래처별 센터를 관리합니다." />
      <AdminDataTableShell
        toolbar={
          <>
            <AdminSearchBar defaultValue={q} />
            <Button asChild>
              <Link href="/admin/centers/new">등록</Link>
            </Button>
          </>
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>센터명</TableHead>
              <TableHead>거래처</TableHead>
              <TableHead>전화</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>등록일</TableHead>
              <TableHead className="w-28" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {(rows ?? []).map((row) => {
              const clientName = clientMap.get(row.client_id) ?? "—";

              return (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.center_name}</TableCell>
                  <TableCell>{clientName}</TableCell>
                  <TableCell>{row.phone ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={row.is_active ? "success" : "outline"}>{row.is_active ? "활성" : "비활성"}</Badge>
                  </TableCell>
                  <TableCell className="text-slate-600">{formatDateKo(row.created_at ?? null)}</TableCell>
                  <TableCell>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/centers/${row.id}/edit`}>수정</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>
            총 {total}건 · {page}/{totalPages} 페이지
          </span>
          <div className="flex gap-2">
            {page > 1 ? (
              <Button asChild size="sm" variant="outline">
                <Link href={`/admin/centers?page=${page - 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`}>이전</Link>
              </Button>
            ) : null}
            {page < totalPages ? (
              <Button asChild size="sm" variant="outline">
                <Link href={`/admin/centers?page=${page + 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`}>다음</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </AdminDataTableShell>
    </div>
  );
}
