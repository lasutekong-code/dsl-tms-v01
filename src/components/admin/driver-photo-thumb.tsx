"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { fetchAdminSignedPhotoUrl } from "@/lib/admin/admin-photo-url";
import { DRIVER_PHOTO_BUCKET } from "@/lib/vehicles/photo-url";

export function DriverPhotoThumb({
  driverName,
  storagePath,
}: {
  driverName: string;
  storagePath: string | null;
}) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      if (!storagePath) {
        setUrl(null);
        return;
      }

      const signed = await fetchAdminSignedPhotoUrl(DRIVER_PHOTO_BUCKET, storagePath);
      if (active) {
        setUrl(signed);
      }
    })();

    return () => {
      active = false;
    };
  }, [storagePath]);

  const initials = driverName.trim().slice(0, 1) || "?";

  return (
    <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
      {url ? (
        <Image src={url} alt={`${driverName} 사진`} fill className="object-cover" unoptimized />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-slate-100 text-xl font-semibold text-slate-500">
          {initials}
        </div>
      )}
    </div>
  );
}
