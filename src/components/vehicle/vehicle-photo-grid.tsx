'use client';

import * as React from 'react';

import type { VehiclePhotoSigned, VehiclePhotosResponse } from '@/types/photo';
import { PhotoViewerDialog } from '@/components/vehicle/photo-viewer-dialog';

const LABEL_MAP: Record<VehiclePhotoSigned['photo_type'], string> = {
  front: '앞면',
  rear: '뒷면',
  side: '옆면',
};

interface VehiclePhotoGridProps {
  vehicleId: string;
}

interface State {
  loading: boolean;
  error: string | null;
  photos: VehiclePhotoSigned[];
}

export function VehiclePhotoGrid({ vehicleId }: VehiclePhotoGridProps) {
  const [state, setState] = React.useState<State>({
    loading: true,
    error: null,
    photos: [],
  });
  const [viewerOpen, setViewerOpen] = React.useState(false);
  const [selectedPhoto, setSelectedPhoto] = React.useState<VehiclePhotoSigned | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const res = await fetch(`/api/vehicles/${vehicleId}/photos`);

        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as
            | { error?: string }
            | null;
          const message =
            body?.error ?? '차량 사진을 불러오는 중 오류가 발생했습니다.';
          if (!cancelled) {
            setState({ loading: false, error: message, photos: [] });
          }
          return;
        }

        const data = (await res.json()) as VehiclePhotosResponse;

        if (!cancelled) {
          setState({
            loading: false,
            error: null,
            photos: data.photos ?? [],
          });
        }
      } catch {
        if (!cancelled) {
          setState({
            loading: false,
            error: '차량 사진을 불러오는 중 오류가 발생했습니다.',
            photos: [],
          });
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [vehicleId]);

  const { loading, error, photos } = state;

  const handleClickPhoto = (photo: VehiclePhotoSigned) => {
    setSelectedPhoto(photo);
    setViewerOpen(true);
  };

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <h2 className="text-base font-semibold sm:text-lg">차량 사진</h2>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="flex flex-col rounded-lg border bg-card p-4 shadow-sm"
            >
              <div className="mb-2 h-4 w-20 animate-pulse rounded bg-muted" />
              <div className="aspect-video w-full animate-pulse rounded-md bg-muted" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : photos.length === 0 ? (
        <div className="flex items-center justify-center rounded-md border bg-muted/40 px-4 py-8 text-sm text-muted-foreground">
          등록된 차량사진이 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {photos.map((photo) => (
            <button
              key={photo.photo_type}
              type="button"
              onClick={() => handleClickPhoto(photo)}
              className="group flex flex-col rounded-lg border bg-card p-4 text-left shadow-sm transition hover:border-primary/60 hover:shadow-md"
            >
              <div className="mb-2 text-sm font-medium text-muted-foreground">
                {LABEL_MAP[photo.photo_type]}
              </div>
              <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.signed_url}
                  alt={LABEL_MAP[photo.photo_type]}
                  className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]"
                />
              </div>
            </button>
          ))}
        </div>
      )}

      <PhotoViewerDialog
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        title={
          selectedPhoto
            ? `차량사진 - ${LABEL_MAP[selectedPhoto.photo_type]}`
            : '차량사진'
        }
        imageUrl={selectedPhoto?.signed_url ?? null}
      />
    </section>
  );
}

