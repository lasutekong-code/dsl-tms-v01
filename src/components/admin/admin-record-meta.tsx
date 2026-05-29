"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateKo } from "@/lib/format/format-date";

type HistoryRow = {
  id: string;
  action: string;
  profile_id: string | null;
  created_at: string | null;
};

export function AdminRecordMeta({
  updatedAt,
  targetTable,
  targetId,
}: {
  updatedAt?: string | null;
  targetTable: string;
  targetId: string;
}) {
  const [lastEditor, setLastEditor] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const params = new URLSearchParams({ target_table: targetTable, target_id: targetId, limit: "1" });
      const res = await fetch(`/api/admin/audit-history?${params.toString()}`);
      if (!res.ok || cancelled) {
        return;
      }

      const json = (await res.json()) as { data?: HistoryRow[] };
      const row = json.data?.[0];
      if (row?.profile_id) {
        setLastEditor(row.profile_id);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [targetTable, targetId]);

  async function loadHistory() {
    const params = new URLSearchParams({ target_table: targetTable, target_id: targetId, limit: "50" });
    const res = await fetch(`/api/admin/audit-history?${params.toString()}`);
    if (!res.ok) {
      return;
    }

    const json = (await res.json()) as { data?: HistoryRow[] };
    setHistory(json.data ?? []);
  }

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
      <span>수정일: {updatedAt ? formatDateKo(updatedAt) : "-"}</span>
      <span>수정자 ID: {lastEditor ?? "-"}</span>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) {
            void loadHistory();
          }
        }}
      >
        <DialogTrigger asChild>
          <Button type="button" variant="outline" size="sm">
            수정이력
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
          <h2 className="text-lg font-semibold text-slate-900">수정 이력</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>일시</TableHead>
                <TableHead>작업</TableHead>
                <TableHead>수정자 ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-slate-500">
                    이력이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                history.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.created_at ? formatDateKo(row.created_at) : "-"}</TableCell>
                    <TableCell>{row.action}</TableCell>
                    <TableCell className="font-mono text-xs">{row.profile_id ?? "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </div>
  );
}
