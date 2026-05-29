"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { AdminFormActions } from "@/components/admin/admin-form-actions";
import { FilePickerButton } from "@/components/admin/file-picker-button";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSectionCard } from "@/components/admin/admin-section-card";
import { Label } from "@/components/ui/label";
import { validatePhotoFile } from "@/lib/admin/photo-file";

export function DriverPhotoUploadForm({
  driverId,
  driverName,
  existingPath,
}: {
  driverId: string;
  driverName: string;
  existingPath: string | null;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const file = selectedFile;
    if (!file || file.size === 0) {
      toast.error("파일을 선택해 주세요.");
      return;
    }

    const fileError = validatePhotoFile(file);
    if (fileError) {
      toast.error(fileError);
      return;
    }

    setPending(true);
    try {
      const fd = new FormData();
      fd.set("driverId", driverId);
      fd.set("file", file);
      const res = await fetch("/api/admin/photos/driver", { method: "POST", body: fd });
      const json: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          json && typeof json === "object" && "error" in json && typeof (json as { error: unknown }).error === "string"
            ? (json as { error: string }).error
            : "업로드에 실패했습니다.";
        toast.error(msg);
        return;
      }

      toast.success("프로필 사진이 저장되었습니다.");
      setPreview(null);
      setSelectedFile(null);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title="운전자 사진 업로드" description={`업로드 대상 운전자: ${driverName}`} />
      <AdminSectionCard title="업로드" sectionId="sec-driver-photo">
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label>파일 (jpg/png/webp, 최대 5MB)</Label>
            <FilePickerButton
              accept="image/jpeg,image/png,image/webp"
              onFileChange={(f) => {
                setSelectedFile(f);
                if (f) {
                  setPreview(URL.createObjectURL(f));
                }
              }}
            />
          </div>
          {preview ? (
            <div className="relative h-40 w-full max-w-sm overflow-hidden rounded-lg border border-slate-200">
              <Image src={preview} alt="미리보기" fill className="object-contain" unoptimized />
            </div>
          ) : null}
          <AdminFormActions isPending={pending} submitLabel="업로드" listHref="/admin/drivers" />
        </form>
        {existingPath ? (
          <p className="mt-4 text-sm text-slate-600">
            현재 경로: <span className="font-mono">{existingPath}</span>
          </p>
        ) : null}
      </AdminSectionCard>
    </div>
  );
}
