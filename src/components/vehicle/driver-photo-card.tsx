'use client';

import * as React from 'react';

import type { DriverPhotoResponse } from '@/types/photo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PhotoViewerDialog } from '@/components/vehicle/photo-viewer-dialog';

interface DriverPhotoCardProps {
  vehicleId: string;
}

interface State {
  loading: boolean;
  error: string | null;
  data: DriverPhotoResponse | null;
}

export function DriverPhotoCard({ vehicleId }: DriverPhotoCardProps) {
  const [state, setState] = React.useState<State>({
    loading: true,
    error: null,
    data: null,
  });
  const [viewerOpen, setViewerOpen] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const res = await fetch(`/api/vehicles/${vehicleId}/driver-photo`);

        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as
            | { error?: string }
            | null;
          const message =
            body?.error ?? '운전자 사진을 불러오는 중 오류가 발생했습니다.';
          if (!cancelled) {
            setState({ loading: false, error: message, data: null });
          }
          return;
        }

        const data = (await res.json()) as DriverPhotoResponse;
        if (!cancelled) {
          setState({
            loading: false,
            error: null,
            data,
          });
        }
      } catch {
        if (!cancelled) {
          setState({
            loading: false,
            error: '운전자 사진을 불러오는 중 오류가 발생했습니다.',
            data: null,
          });
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [vehicleId]);

  const { loading, error, data } = state;
  const photo = data?.photo ?? null;

  const handleClick = () => {
    if (!photo) return;
    setViewerOpen(true);
  };

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <h2 className="text-base font-semibold sm:text-lg">운전자 사진</h2>
      </header>

      <div className="rounded-lg border bg-card p-4 shadow-sm">
        {loading ? (
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 animate-pulse rounded-full bg-muted" />
            <div className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-3 w-32 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ) : error ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : (
          <button
            type="button"
            onClick={handleClick}
            className="flex w-full items-center gap-4 text-left"
          >
            <Avatar className="h-16 w-16 border">
              {photo ? (
                <AvatarImage src={photo.signed_url} alt="운전자 사진" />
              ) : (
                <AvatarFallback className="bg-muted text-xs text-muted-foreground">
                  사진 없음
                </AvatarFallback>
              )}
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {photo ? '등록된 운전자 사진' : '등록된 운전자 사진이 없습니다.'}
              </p>
              <p className="text-xs text-muted-foreground">
                클릭하여 자세히 보기
              </p>
            </div>
          </button>
        )}
      </div>

      <PhotoViewerDialog
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        title="운전자 사진"
        imageUrl={photo?.signed_url ?? null}
      />
    </section>
  );
}

