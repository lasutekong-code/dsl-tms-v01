"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { roleLabels } from "@/lib/auth/profile-display";
import { formatDateKo } from "@/lib/format/format-date";
import type { UserRole } from "@/types/vehicle";

export type PendingUserRow = {
  id: string;
  role: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string | null;
};

export type PendingRequestRow = {
  id: string;
  request_type: string;
  email: string;
  name: string | null;
  role: string | null;
  message: string | null;
  created_at: string | null;
  profile_id: string | null;
};

export function UserApprovalsPanel({
  pendingUsers,
  pendingRequests,
}: {
  pendingUsers: PendingUserRow[];
  pendingRequests: PendingRequestRow[];
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function approve(userId: string) {
    setPendingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/approve`, { method: "POST" });
      const json: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const err =
          json && typeof json === "object" && "error" in json && typeof (json as { error: unknown }).error === "string"
            ? (json as { error: string }).error
            : "승인에 실패했습니다.";
        toast.error(err);
        return;
      }
      toast.success("로그인 승인이 완료되었습니다.");
      router.refresh();
    } finally {
      setPendingId(null);
    }
  }

  async function reject(userId: string) {
    setPendingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "관리자 거절" }),
      });
      const json: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const err =
          json && typeof json === "object" && "error" in json && typeof (json as { error: unknown }).error === "string"
            ? (json as { error: string }).error
            : "거절 처리에 실패했습니다.";
        toast.error(err);
        return;
      }
      toast.success("거절 처리되었습니다.");
      router.refresh();
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">로그인 승인 대기 ({pendingUsers.length})</h2>
        <p className="text-sm text-slate-600">승인하면 해당 사용자가 선택한 역할로 로그인할 수 있습니다.</p>
        {pendingUsers.length === 0 ? (
          <p className="text-sm text-slate-500">승인 대기 중인 사용자가 없습니다.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>이메일(아이디)</TableHead>
                <TableHead>역할</TableHead>
                <TableHead>연락처</TableHead>
                <TableHead>신청일</TableHead>
                <TableHead className="w-40" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name ?? "—"}</TableCell>
                  <TableCell>{u.email ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {roleLabels[u.role as UserRole] ?? u.role ?? "—"}
                    </Badge>
                  </TableCell>
                  <TableCell>{u.phone ?? "—"}</TableCell>
                  <TableCell className="text-slate-600">{formatDateKo(u.created_at)}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button size="sm" disabled={pendingId === u.id} onClick={() => approve(u.id)}>
                      승인
                    </Button>
                    <Button size="sm" variant="outline" disabled={pendingId === u.id} onClick={() => reject(u.id)}>
                      거절
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">아이디·비밀번호 찾기 요청 ({pendingRequests.length})</h2>
        {pendingRequests.length === 0 ? (
          <p className="text-sm text-slate-500">대기 중인 요청이 없습니다.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>유형</TableHead>
                <TableHead>이름</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead>역할</TableHead>
                <TableHead>메모</TableHead>
                <TableHead>접수일</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingRequests.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    {r.request_type === "find_id" ? "아이디 찾기" : r.request_type === "find_password" ? "비밀번호 찾기" : r.request_type}
                  </TableCell>
                  <TableCell>{r.name ?? "—"}</TableCell>
                  <TableCell>{r.email}</TableCell>
                  <TableCell>{r.role ? (roleLabels[r.role as UserRole] ?? r.role) : "—"}</TableCell>
                  <TableCell className="max-w-xs truncate text-slate-600">{r.message ?? "—"}</TableCell>
                  <TableCell className="text-slate-600">{formatDateKo(r.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
}
