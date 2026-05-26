"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DRIVER_PHOTO_BUCKET,
  VEHICLE_PHOTO_BUCKET,
  fetchSignedPhotoUrl,
} from "@/lib/vehicles/photo-url";

type PhotoRef = {
  bucket: string;
  path: string;
};

export type VehicleSearchResult = {
  id: string;
  plateNumber: string;
  vehicleNumber: string | null;
  vehicleType: string | null;
  clientName: string | null;
  centerName: string | null;
  driverId: string | null;
  driverName: string | null;
  driverPhone: string | null;
  vehiclePhotos: PhotoRef[];
  driverPhoto: PhotoRef | null;
};

export function VehicleResultCard({ result }: { result: VehicleSearchResult }) {
  const [vehicleUrls, setVehicleUrls] = useState<string[]>([]);
  const [driverUrl, setDriverUrl] = useState<string | null>(null);
  const vehiclePhotos = useMemo(() => result.vehiclePhotos.slice(0, 3), [result.vehiclePhotos]);

  useEffect(() => {
    let mounted = true;

    async function loadPhotos() {
      const urls = await Promise.all(
        vehiclePhotos.map((photo) =>
          fetchSignedPhotoUrl({
            bucket: photo.bucket || VEHICLE_PHOTO_BUCKET,
            path: photo.path,
            vehicleId: result.id,
          }),
        ),
      );

      const driverPhotoUrl = result.driverPhoto
        ? await fetchSignedPhotoUrl({
            bucket: result.driverPhoto.bucket || DRIVER_PHOTO_BUCKET,
            path: result.driverPhoto.path,
            vehicleId: result.id,
          })
        : null;

      if (mounted) {
        setVehicleUrls(urls.filter(Boolean) as string[]);
        setDriverUrl(driverPhotoUrl);
      }
    }

    void loadPhotos();

    return () => {
      mounted = false;
    };
  }, [result.driverPhoto, result.id, vehiclePhotos]);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="space-y-1">
        <Link href={`/vehicles/${result.id}`} className="text-lg font-bold text-slate-900 hover:text-blue-600">
          {result.plateNumber}
        </Link>
        <p className="text-sm text-slate-500">
          {result.clientName ?? "거래처 미지정"} / {result.centerName ?? "센터 미지정"}
        </p>
      </CardHeader>
      <CardContent className="mt-auto space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {vehicleUrls.length > 0
            ? vehicleUrls.map((url) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={url}
                  alt={`${result.plateNumber} 차량 사진`}
                  src={url}
                  className="aspect-[4/3] w-full rounded-md object-cover"
                />
              ))
            : [0, 1, 2].map((index) => (
                <div key={index} className="aspect-[4/3] rounded-md bg-slate-100" aria-label="차량 사진 없음" />
              ))}
        </div>

        <div className="flex items-center gap-3">
          {driverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={`${result.driverName ?? "운전자"} 사진`}
              src={driverUrl}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-slate-100" />
          )}
          <div>
            <p className="font-semibold text-slate-900">{result.driverName ?? "운전자 미지정"}</p>
            <p className="text-sm text-slate-500">{result.driverPhone ?? "연락처 비공개"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
