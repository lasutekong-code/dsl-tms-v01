"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { AdminFormActions } from "@/components/admin/admin-form-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function AdminDashboardEditor({
  initialQuickGuide,
  initialPhotoGuide,
}: {
  initialQuickGuide: string;
  initialPhotoGuide: string;
}) {
  const router = useRouter();
  const [quickGuide, setQuickGuide] = useState(initialQuickGuide);
  const [photoGuide, setPhotoGuide] = useState(initialPhotoGuide);
  const [pending, setPending] = useState(false);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      const res = await fetch("/api/admin/dashboard-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quick_guide: quickGuide, photo_guide: photoGuide }),
      });
      const json: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          json && typeof json === "object" && "error" in json && typeof (json as { error: unknown }).error === "string"
            ? (json as { error: string }).error
            : "저장에 실패했습니다.";
        toast.error(msg);
        return;
      }

      toast.success("대시보드 안내가 저장되었습니다.");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSave} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>빠른 안내</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="quick_guide">게시 내용</Label>
              <Textarea id="quick_guide" rows={6} value={quickGuide} onChange={(e) => setQuickGuide(e.target.value)} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>사진 업로드 안내</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="photo_guide">게시 내용</Label>
              <Textarea id="photo_guide" rows={6} value={photoGuide} onChange={(e) => setPhotoGuide(e.target.value)} />
            </div>
          </CardContent>
        </Card>
      </div>
      <AdminFormActions isPending={pending} submitLabel="게시 내용 저장" />
    </form>
  );
}
