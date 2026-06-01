"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { AdminSectionCard } from "@/components/admin/admin-section-card";
import { fetchAdminSignedPhotoUrl } from "@/lib/admin/admin-photo-url";
import { VEHICLE_PHOTO_BUCKET } from "@/lib/vehicles/photo-url";
import { VEHICLE_PHOTO_TYPES } from "@/types/admin";

const PHOTO_LABELS: Record<string, string> = {
  front: "전면",
  rear: "후면",
  side: "측면",
};

export function AdminVehiclePhotosPanel({
  photos,
}: {
  photos: { photo_type: string; storage_path: string }[];
}) {
  const [urls, setUrls] = useState<Record<string, string | null>>({});

  useEffect(() => {
    let active = true;

    async function load() {
      const next: Record<string, string | null> = {};
      await Promise.all(
        photos.map(async (p) => {
          if (!p.photo_type || !p.storage_path) {
            return;
          }

          next[p.photo_type] = await fetchAdminSignedPhotoUrl(VEHICLE_PHOTO_BUCKET, p.storage_path);
        }),
      );

      if (active) {
        setUrls(next);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [photos]);

  const ordered = VEHICLE_PHOTO_TYPES.map((t) => t.value);

  return (
    <AdminSectionCard title="차량 사진" sectionId="sec-vehicle-photos-view">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {ordered.map((type) => {
          const url = urls[type];
          const label = PHOTO_LABELS[type] ?? type;
          return (
            <div key={type} className="overflow-hidden rounded-lg border border-slate-200">
              <div className="relative aspect-[4/3] bg-slate-50">
                {url ? (
                  <Image src={url} alt={label} fill className="object-contain" unoptimized />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">사진 없음</div>
                )}
              </div>
              <p className="border-t border-slate-200 px-3 py-2 text-center text-sm font-medium text-slate-700">{label}</p>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-sm text-slate-500">
        사진 변경은 차량 목록의 &quot;사진&quot; 메뉴 또는 별도 업로드 화면에서 할 수 있습니다.
      </p>
    </AdminSectionCard>
  );
}
