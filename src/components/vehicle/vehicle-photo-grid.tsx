"use client";

import { useEffect, useState } from "react";
import { ImageIcon } from "lucide-react";

import { PhotoViewerDialog } from "@/components/vehicle/photo-viewer-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DRIVER_PHOTO_BUCKET,
  VEHICLE_PHOTO_BUCKET,
  fetchSignedPhotoUrl,
} from "@/lib/vehicles/photo-url";
import type { VehiclePhoto, VehiclePhotoType } from "@/types/vehicle";

const PHOTO_LABELS: Record<VehiclePhotoType, string> = {
  front: "앞면",
  rear: "뒷면",
  side: "옆면",
};

type VehiclePhotoGridProps = {
  vehicleId: string;
  photos: VehiclePhoto[];
};

export function VehiclePhotoGrid({ vehicleId, photos }: VehiclePhotoGridProps) {
  const [urls, setUrls] = useState<Record<VehiclePhotoType, string | null>>({
    front: null,
    rear: null,
    side: null,
  });
  const [viewer, setViewer] = useState<{ title: string; url: string | null } | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      const next: Record<VehiclePhotoType, string | null> = { front: null, rear: null, side: null };

      await Promise.all(
        photos.map(async (photo) => {
          if (photo.signed_url) {
            next[photo.photo_type] = photo.signed_url;
            return;
          }

          if (!photo.storage_path) {
            return;
          }

          const signed = await fetchSignedPhotoUrl({
            bucket: VEHICLE_PHOTO_BUCKET,
            path: photo.storage_path,
            vehicleId,
          });

          next[photo.photo_type] = signed;
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
  }, [photos, vehicleId]);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>차량 사진</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {photos.map((photo) => {
              const url = urls[photo.photo_type];
              const label = PHOTO_LABELS[photo.photo_type];

              return (
                <button
                  key={photo.id}
                  type="button"
                  className="group overflow-hidden rounded-lg border border-slate-200 bg-slate-50 text-left transition hover:border-blue-300 hover:shadow-sm"
                  onClick={() => setViewer({ title: label, url })}
                  disabled={!url}
                >
                  <div className="relative aspect-[4/3] w-full">
                    {url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img alt={label} src={url} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
                        <ImageIcon className="h-8 w-8" />
                        <span className="text-xs font-medium">사진 없음</span>
                      </div>
                    )}
                  </div>
                  <div className="border-t border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">
                    {label}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <PhotoViewerDialog
        open={Boolean(viewer)}
        onOpenChange={(open) => !open && setViewer(null)}
        title={viewer?.title ?? ""}
        imageUrl={viewer?.url ?? null}
      />
    </>
  );
}

export function DriverPhotoCard({
  vehicleId,
  driverName,
  photo,
}: {
  vehicleId: string;
  driverName: string | null;
  photo: { id: string; storage_path: string | null; signed_url: string | null } | null;
}) {
  const [url, setUrl] = useState<string | null>(photo?.signed_url ?? null);
  const [viewerOpen, setViewerOpen] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      if (photo?.signed_url) {
        setUrl(photo.signed_url);
        return;
      }

      if (!photo?.storage_path) {
        setUrl(null);
        return;
      }

      const signed = await fetchSignedPhotoUrl({
        bucket: DRIVER_PHOTO_BUCKET,
        path: photo.storage_path,
        vehicleId,
      });

      if (active) {
        setUrl(signed);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [photo, vehicleId]);

  const initials = driverName?.trim().slice(0, 1) ?? "?";

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>운전자 사진</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3 py-6">
          <button
            type="button"
            className="relative h-36 w-36 overflow-hidden rounded-full border border-slate-200 bg-slate-50"
            onClick={() => url && setViewerOpen(true)}
            disabled={!url}
          >
            {url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt={`${driverName ?? "운전자"} 사진`} src={url} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-100 text-2xl font-bold text-slate-500">
                {initials}
              </div>
            )}
          </button>
          <p className="text-sm text-slate-500">{url ? "클릭하여 확대" : "사진 없음"}</p>
        </CardContent>
      </Card>

      <PhotoViewerDialog
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        title={`${driverName ?? "운전자"} 사진`}
        imageUrl={url}
      />
    </>
  );
}
