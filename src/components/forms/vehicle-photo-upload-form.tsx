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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { validatePhotoFile } from "@/lib/admin/photo-file";
import { VEHICLE_PHOTO_TYPES } from "@/types/admin";

export function VehiclePhotoUploadForm({
  vehicleId,
  vehicleNo,
  existing,
}: {
  vehicleId: string;
  vehicleNo: string;
  existing: { photo_type: string | null; storage_path: string }[];
}) {
  const router = useRouter();
  const [photoType, setPhotoType] = useState<string>("front");
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
      fd.set("vehicleId", vehicleId);
      fd.set("photoType", photoType);
      fd.set("file", file);
      const res = await fetch("/api/admin/photos/vehicle", { method: "POST", body: fd });
      const json: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          json && typeof json === "object" && "error" in json && typeof (json as { error: unknown }).error === "string"
            ? (json as { error: string }).error
            : "업로드에 실패했습니다.";
        toast.error(msg);
        return;
      }

      toast.success("사진이 저장되었습니다.");
      setPreview(null);
      setSelectedFile(null);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title="차량 사진 업로드" description={`업로드 대상 차량번호: ${vehicleNo}`} />
      <AdminSectionCard title="업로드" sectionId="sec-vehicle-photo">
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label>사진 종류</Label>
            <Select value={photoType} onValueChange={setPhotoType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VEHICLE_PHOTO_TYPES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
          <AdminFormActions isPending={pending} submitLabel="업로드" listHref="/admin/vehicles" />
        </form>
        <div className="mt-6 text-sm text-slate-600">
          <p className="font-medium">등록된 사진</p>
          <ul className="mt-2 list-inside list-disc">
            {existing.map((p) => (
              <li key={`${p.photo_type}-${p.storage_path}`}>
                {p.photo_type}: {p.storage_path}
              </li>
            ))}
          </ul>
        </div>
      </AdminSectionCard>
    </div>
  );
}
