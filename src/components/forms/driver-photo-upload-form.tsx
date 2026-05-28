"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { AdminFormActions } from "@/components/admin/admin-form-actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSectionCard } from "@/components/admin/admin-section-card";
import { Label } from "@/components/ui/label";
import { validatePhotoFile } from "@/lib/admin/photo-file";

export function DriverPhotoUploadForm({
  driverId,
  existingPath,
}: {
  driverId: string;
  existingPath: string | null;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function onUpload(formData: FormData) {
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      fileInputRef.current?.click();
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
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title="운전자 사진 업로드" description="프로필 사진 1장을 등록합니다." />
      <AdminSectionCard title="업로드" sectionId="sec-driver-photo">
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            await onUpload(new FormData(e.currentTarget));
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="file">파일 (jpg/png/webp, 최대 5MB)</Label>
            <input
              ref={fileInputRef}
              id="file"
              name="file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="block w-full text-sm"
              onChange={(e) => {
                const f = e.target.files?.[0];
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
