"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { Card } from "@/components/ui/card";

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

async function requestSignedUrl(photo: PhotoRef, vehicleId: string, driverId?: string | null) {
  const response = await fetch("/api/photos/signed-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      bucket: photo.bucket,
      path: photo.path,
      vehicleId,
      driverId
    })
  });

  if (!response.ok) {
    return null;
  }

  const body = (await response.json()) as { signedUrl?: string };
  return body.signedUrl ?? null;
}

export function VehicleResultCard({ result }: { result: VehicleSearchResult }) {
  const [vehicleUrls, setVehicleUrls] = useState<string[]>([]);
  const [driverUrl, setDriverUrl] = useState<string | null>(null);
  const vehiclePhotos = useMemo(() => result.vehiclePhotos.slice(0, 3), [result.vehiclePhotos]);

  useEffect(() => {
    let mounted = true;

    async function loadPhotos() {
      const urls = await Promise.all(
        vehiclePhotos.map((photo) => requestSignedUrl(photo, result.id, result.driverId))
      );

      const driverPhotoUrl = result.driverPhoto
        ? await requestSignedUrl(result.driverPhoto, result.id, result.driverId)
        : null;

      if (mounted) {
        setVehicleUrls(urls.filter(Boolean) as string[]);
        setDriverUrl(driverPhotoUrl);
      }
    }

    loadPhotos();

    return () => {
      mounted = false;
    };
  }, [result.driverId, result.driverPhoto, result.id, vehiclePhotos]);

  return (
    <Card className="stack">
      <div>
        <Link href={`/vehicles/${result.id}`} style={{ fontSize: 20, fontWeight: 800 }}>
          {result.plateNumber}
        </Link>
        <p style={{ color: "var(--muted)", margin: "6px 0 0" }}>
          {result.clientName ?? "거래처 미지정"} / {result.centerName ?? "센터 미지정"}
        </p>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
        {vehicleUrls.length > 0
          ? vehicleUrls.map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt={`${result.plateNumber} 차량 사진`}
                key={url}
                src={url}
                style={{ aspectRatio: "4 / 3", borderRadius: 12, objectFit: "cover", width: "100%" }}
              />
            ))
          : [0, 1, 2].map((index) => (
              <div
                aria-label="차량 사진 없음"
                key={index}
                style={{ aspectRatio: "4 / 3", background: "#eef2f7", borderRadius: 12 }}
              />
            ))}
      </div>

      <div style={{ alignItems: "center", display: "flex", gap: 12 }}>
        {driverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={`${result.driverName ?? "운전자"} 사진`}
            src={driverUrl}
            style={{ borderRadius: "50%", height: 56, objectFit: "cover", width: 56 }}
          />
        ) : (
          <div style={{ background: "#eef2f7", borderRadius: "50%", height: 56, width: 56 }} />
        )}
        <div>
          <div style={{ fontWeight: 700 }}>{result.driverName ?? "운전자 미지정"}</div>
          <div style={{ color: "var(--muted)", fontSize: 14 }}>{result.driverPhone ?? "연락처 비공개"}</div>
        </div>
      </div>
    </Card>
  );
}
