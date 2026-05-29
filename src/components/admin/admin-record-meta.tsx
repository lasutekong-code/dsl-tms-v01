"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateKo } from "@/lib/format/format-date";

type HistoryRow = {
  id: string;
  action: string;
  profile_id: string | null;
  login_id: string | null;
  created_at: string | null;
  metadata?: { detail_action?: string } | null;
};

function formatHistoryAction(row: HistoryRow) {
  const detail = row.metadata?.detail_action;
  return detail && detail !== row.action ? detail : row.action;
}

export function AdminRecordMeta({
  updatedAt,
  targetTable,
  targetId,
}: {
  updatedAt?: string | null;
  targetTable: string;
  targetId: string;
}) {
  const [loginId, setLoginId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [open, setOpen] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const res = await fetch("/api/admin/session");
      if (!res.ok || cancelled) {
        return;
      }

      const json = (await res.json()) as { data?: { loginId?: string } };
      if (json.data?.loginId) {
        setLoginId(json.data.loginId);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function loadHistory() {
    setHistoryError(null);
    const params = new URLSearchParams({ target_table: targetTable, target_id: targetId, limit: "50" });
    const res = await fetch(`/api/admin/audit-history?${params.toString()}`);
    if (!res.ok) {
      const json = (await res.json().catch(() => null)) as { error?: string } | null;
      setHistoryError(json?.error ?? "이력을 불러오지 못했습니다.");
      setHistory([]);
      return;
    }

    const json = (await res.json()) as { data?: HistoryRow[] };
    setHistory(json.data ?? []);
  }

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
      <span>수정일: {updatedAt ? formatDateKo(updatedAt) : "-"}</span>
      <span>로그인 ID: {loginId ?? "-"}</span>
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
          <DialogTitle className="text-lg font-semibold text-slate-900">수정 이력</DialogTitle>
          {historyError ? <p className="text-sm text-red-600">{historyError}</p> : null}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>일시</TableHead>
                <TableHead>작업</TableHead>
                <TableHead>로그인 ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-slate-500">
                    {historyError ? "-" : "이력이 없습니다."}
                  </TableCell>
                </TableRow>
              ) : (
                history.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.created_at ? formatDateKo(row.created_at) : "-"}</TableCell>
                    <TableCell>{formatHistoryAction(row)}</TableCell>
                    <TableCell className="text-xs">{row.login_id ?? row.profile_id ?? "-"}</TableCell>
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
