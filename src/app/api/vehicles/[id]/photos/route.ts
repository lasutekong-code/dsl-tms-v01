import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import type { SupabaseClient } from '@supabase/supabase-js';

import { canAccessVehicle } from '@/lib/permissions/can-access-vehicle';
import { createStorageSignedUrl } from '@/lib/storage/create-signed-url';
import type { VehiclePhotosResponse, VehiclePhotoSigned } from '@/types/photo';

const VEHICLE_PHOTO_EXPIRES_IN = 600;

const VEHICLE_PHOTO_ORDER: Record<string, number> = {
  front: 1,
  rear: 2,
  side: 3,
};

function isUuid(id: string): boolean {
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
    id,
  );
}

function getSupabase(req: NextRequest): SupabaseClient {
  return createRouteHandlerClient({
    cookies,
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const vehicleId = params.id;

  if (!vehicleId || !isUuid(vehicleId)) {
    return NextResponse.json(
      { error: '잘못된 차량 ID 입니다.' },
      { status: 400 },
    );
  }

  const supabase = getSupabase(req);

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 },
      );
    }

    const access = await canAccessVehicle(supabase, user.id, vehicleId);

    if (!access.allowed) {
      return NextResponse.json(
        { error: '이 차량 사진을 볼 권한이 없습니다.' },
        { status: 403 },
      );
    }

    const { data: rows, error: photosError } = await supabase
      .from('vehicle_photos')
      .select('photo_type, storage_path')
      .eq('vehicle_id', vehicleId);

    if (photosError) {
      return NextResponse.json(
        { error: '차량 사진을 불러오는 중 오류가 발생했습니다.' },
        { status: 500 },
      );
    }

    const photos: VehiclePhotoSigned[] = [];

    if (rows && rows.length > 0) {
      for (const row of rows) {
        const { photo_type, storage_path } = row as {
          photo_type: string;
          storage_path: string | null;
        };

        if (!storage_path) continue;

        try {
          const signed = await createStorageSignedUrl(
            supabase,
            'vehicle-photos',
            storage_path,
            VEHICLE_PHOTO_EXPIRES_IN,
          );

          photos.push({
            photo_type: photo_type as VehiclePhotoSigned['photo_type'],
            signed_url: signed.signed_url,
            expires_in: signed.expires_in,
          });
        } catch {
          // 개별 사진 실패는 전체 응답을 막지 않고 건너뜀
        }
      }
    }

    photos.sort((a, b) => {
      const orderA = VEHICLE_PHOTO_ORDER[a.photo_type] ?? 99;
      const orderB = VEHICLE_PHOTO_ORDER[b.photo_type] ?? 99;
      return orderA - orderB;
    });

    // 감사 로그 기록 (실패하더라도 응답에는 영향 주지 않음)
    void supabase
      .from('audit_logs')
      .insert({
        profile_id: user.id,
        vehicle_id: vehicleId,
        action: 'view_vehicle_photo',
      })
      .then(() => {})
      .catch(() => {});

    const response: VehiclePhotosResponse = {
      vehicle_id: vehicleId,
      photos,
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { error: '요청을 처리하는 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

