"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { AdminFormActions } from "@/components/admin/admin-form-actions";
import { AdminSectionCard } from "@/components/admin/admin-section-card";
import { FieldGrid, FieldFull } from "@/components/admin/field-grid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { formatDateKo } from "@/lib/format/format-date";
import { MEMO_VISIBILITY_OPTIONS } from "@/types/admin";
import type { MemoRow } from "@/types/database";

function parseApiError(payload: unknown): string {
  if (payload && typeof payload === "object" && "error" in payload && typeof (payload as { error: unknown }).error === "string") {
    return (payload as { error: string }).error;
  }

  return "요청 처리 중 오류가 발생했습니다.";
}

export function DriverMemosPanel({ driverId, memos }: { driverId: string; memos: MemoRow[] }) {
  const router = useRouter();
  const [pendingNew, setPendingNew] = useState(false);
  const [newMemoType, setNewMemoType] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newVisibility, setNewVisibility] = useState<string>("internal");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMemoType, setEditMemoType] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editVisibility, setEditVisibility] = useState("internal");
  const [pendingEdit, setPendingEdit] = useState(false);

  function startEdit(m: MemoRow) {
    setEditingId(m.id);
    setEditMemoType(m.memo_type ?? "");
    setEditContent(m.content);
    setEditVisibility(m.visibility ?? "internal");
  }

  async function submitNew(e: React.FormEvent) {
    e.preventDefault();
    if (!newContent.trim()) {
      toast.error("메모 내용을 입력해 주세요.");
      return;
    }

    setPendingNew(true);
    try {
      const res = await fetch("/api/admin/memos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_table: "drivers",
          target_id: driverId,
          memo_type: newMemoType.trim() ? newMemoType.trim() : null,
          content: newContent.trim(),
          visibility: newVisibility,
        }),
      });
      const json: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(parseApiError(json));
        return;
      }

      toast.success("메모가 등록되었습니다.");
      setNewMemoType("");
      setNewContent("");
      setNewVisibility("internal");
      router.refresh();
    } finally {
      setPendingNew(false);
    }
  }

  async function submitEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) {
      return;
    }

    if (!editContent.trim()) {
      toast.error("메모 내용을 입력해 주세요.");
      return;
    }

    setPendingEdit(true);
    try {
      const res = await fetch(`/api/admin/memos/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memo_type: editMemoType.trim() ? editMemoType.trim() : null,
          content: editContent.trim(),
          visibility: editVisibility,
        }),
      });
      const json: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(parseApiError(json));
        return;
      }

      toast.success("메모가 저장되었습니다.");
      setEditingId(null);
      router.refresh();
    } finally {
      setPendingEdit(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">메모</h2>
        <p className="mt-1 text-sm text-slate-600">운전자 관련 메모를 등록·수정합니다.</p>
      </div>

      <AdminSectionCard title="새 메모" sectionId="sec-driver-memo-new">
        <form onSubmit={submitNew} className="space-y-4">
          <FieldGrid>
            <div className="space-y-2">
              <Label htmlFor="new-memo-type">메모 유형</Label>
              <Input id="new-memo-type" value={newMemoType} onChange={(e) => setNewMemoType(e.target.value)} placeholder="선택 입력" />
            </div>
            <div className="space-y-2">
              <Label>
                공개 범위 <span className="text-red-600">*</span>
              </Label>
              <Select value={newVisibility} onValueChange={setNewVisibility}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEMO_VISIBILITY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <FieldFull>
              <div className="space-y-2">
                <Label htmlFor="new-memo-content">
                  내용 <span className="text-red-600">*</span>
                </Label>
                <Textarea id="new-memo-content" rows={4} value={newContent} onChange={(e) => setNewContent(e.target.value)} />
              </div>
            </FieldFull>
          </FieldGrid>
          <AdminFormActions isPending={pendingNew} submitLabel="메모 등록" listHref="/admin/drivers" />
        </form>
      </AdminSectionCard>

      <AdminSectionCard title="메모 목록" sectionId="sec-driver-memo-list">
        {editingId ? (
          <form onSubmit={submitEdit} className="mb-6 space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-800">메모 수정</p>
            <FieldGrid>
              <div className="space-y-2">
                <Label htmlFor="edit-memo-type">메모 유형</Label>
                <Input id="edit-memo-type" value={editMemoType} onChange={(e) => setEditMemoType(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>공개 범위</Label>
                <Select value={editVisibility} onValueChange={setEditVisibility}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEMO_VISIBILITY_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <FieldFull>
                <div className="space-y-2">
                  <Label htmlFor="edit-memo-content">내용</Label>
                  <Textarea id="edit-memo-content" rows={4} value={editContent} onChange={(e) => setEditContent(e.target.value)} />
                </div>
              </FieldFull>
            </FieldGrid>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={pendingEdit}>
                {pendingEdit ? "저장 중..." : "저장"}
              </Button>
              <Button type="button" variant="outline" disabled={pendingEdit} onClick={() => setEditingId(null)}>
                취소
              </Button>
            </div>
          </form>
        ) : null}

        {memos.length === 0 ? (
          <p className="text-sm text-slate-600">등록된 메모가 없습니다.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>유형</TableHead>
                <TableHead>내용</TableHead>
                <TableHead>공개</TableHead>
                <TableHead>등록일</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {memos.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="text-slate-700">{m.memo_type ?? "—"}</TableCell>
                  <TableCell className="max-w-md truncate text-slate-800">{m.content}</TableCell>
                  <TableCell className="text-slate-600">{m.visibility ?? "—"}</TableCell>
                  <TableCell className="text-slate-600">{formatDateKo(m.created_at)}</TableCell>
                  <TableCell>
                    <Button type="button" size="sm" variant="outline" disabled={editingId !== null} onClick={() => startEdit(m)}>
                      수정
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </AdminSectionCard>
    </div>
  );
}
