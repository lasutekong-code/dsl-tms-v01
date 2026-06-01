export const dynamic = "force-dynamic";

import { AdminDataTableShell, AdminSearchBar } from "@/components/admin/admin-data-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateKo } from "@/lib/format/format-date";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 30;

type PageProps = {
  searchParams?: Promise<{ q?: string; page?: string }>;
};

export default async function AdminLogsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const q = (sp?.q ?? "").trim();
  const page = Math.max(1, Number.parseInt(sp?.page ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();
  let query = supabase.from("audit_logs").select("*", { count: "exact" }).order("created_at", { ascending: false });
  if (q) {
    query = query.or(`action.ilike.%${q}%,target_table.ilike.%${q}%,target_id.ilike.%${q}%`);
  }
  const { data: rows, count, error } = await query.range(from, to);

  return (
    <div className="space-y-6">
      <AdminPageHeader title="로그 관리" description="audit_logs 기반 이벤트 로그 목록입니다." />
      <AdminDataTableShell toolbar={<AdminSearchBar placeholder="action, table, target id 검색" name="q" defaultValue={q} />}>
        {error ? (
          <p className="py-6 text-sm text-red-600">로그를 불러오지 못했습니다.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>일시</TableHead>
                <TableHead>액션</TableHead>
                <TableHead>테이블</TableHead>
                <TableHead>대상 ID</TableHead>
                <TableHead>민감필드</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(rows ?? []).map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{formatDateKo(row.created_at)}</TableCell>
                  <TableCell>{row.action}</TableCell>
                  <TableCell>{row.target_table ?? "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{row.target_id ?? "—"}</TableCell>
                  <TableCell>
                    {row.sensitive_fields && row.sensitive_fields.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {row.sensitive_fields.map((field) => (
                          <Badge key={`${row.id}-${field}`} variant="outline">
                            {field}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <p className="text-sm text-slate-500">총 {count ?? 0}건</p>
      </AdminDataTableShell>
    </div>
  );
}
