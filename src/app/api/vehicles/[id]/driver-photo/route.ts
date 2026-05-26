import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import type { SupabaseClient } from '@supabase/supabase-js';

import { canAccessVehicle } from '@/lib/permissions/can-access-vehicle';
import { createStorageSignedUrl } from '@/lib/storage/create-signed-url';
import type { DriverPhotoResponse, DriverPhotoSigned } from '@/types/photo';

const DRIVER_PHOTO_EXPIRES_IN = 600;

function isUuid(id: string): boolean {
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
    id,
  );
}

function getSupabase(): SupabaseClient {
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

  const supabase = getSupabase();

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
        { error: '이 차량의 운전자 사진을 볼 권한이 없습니다.' },
        { status: 403 },
      );
    }

    const { data: assignment, error: assignmentError } = await supabase
      .from('vehicle_assignments')
      .select('driver_id')
      .eq('vehicle_id', vehicleId)
      .order('created_at', { ascending: false })
      .maybeSingle();

    if (assignmentError) {
      return NextResponse.json(
        { error: '운전자 정보를 불러오는 중 오류가 발생했습니다.' },
        { status: 500 },
      );
    }

    const driverId = assignment?.driver_id ?? null;

    if (!driverId) {
      const emptyResponse: DriverPhotoResponse = {
        vehicle_id: vehicleId,
        driver_id: null,
        photo: null,
      };
      return NextResponse.json(emptyResponse);
    }

    const { data: driverPhoto, error: photoError } = await supabase
      .from('driver_photos')
      .select('storage_path, created_at')
      .eq('driver_id', driverId)
      .order('created_at', { ascending: false })
      .maybeSingle();

    if (photoError) {
      return NextResponse.json(
        { error: '운전자 사진을 불러오는 중 오류가 발생했습니다.' },
        { status: 500 },
      );
    }

    let photo: DriverPhotoSigned | null = null;

    if (driverPhoto?.storage_path) {
      try {
        const signed = await createStorageSignedUrl(
          supabase,
          'driver-photos',
          driverPhoto.storage_path as string,
          DRIVER_PHOTO_EXPIRES_IN,
        );

        photo = {
          signed_url: signed.signed_url,
          expires_in: signed.expires_in,
        };
      } catch {
        // 서명 URL 생성 실패 시 사진을 null로 반환
        photo = null;
      }
    }

    // 감사 로그 기록
    void supabase
      .from('audit_logs')
      .insert({
        profile_id: user.id,
        vehicle_id: vehicleId,
        action: 'view_driver_photo',
      })
      .then(() => {})
      .catch(() => {});

    const response: DriverPhotoResponse = {
      vehicle_id: vehicleId,
      driver_id: driverId,
      photo,
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { error: '요청을 처리하는 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

