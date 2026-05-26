import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import type { SupabaseClient } from '@supabase/supabase-js';

import { canAccessVehicle } from '@/lib/permissions/can-access-vehicle';
import { createStorageSignedUrl } from '@/lib/storage/create-signed-url';

const SIGNED_URL_EXPIRES_IN = 600;
const ALLOWED_BUCKETS = new Set(['vehicle-photos', 'driver-photos']);

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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const bucket = searchParams.get('bucket') ?? '';
  const path = searchParams.get('path') ?? '';
  const vehicleId = searchParams.get('vehicleId') ?? '';
  const driverId = searchParams.get('driverId'); // currently unused but kept for future use

  if (!ALLOWED_BUCKETS.has(bucket)) {
    return NextResponse.json(
      { error: '허용되지 않은 bucket 입니다.' },
      { status: 400 },
    );
  }

  if (!vehicleId || !isUuid(vehicleId)) {
    return NextResponse.json(
      { error: '잘못된 차량 ID 입니다.' },
      { status: 400 },
    );
  }

  if (!path) {
    return NextResponse.json(
      { error: '잘못된 경로 입니다.' },
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
        { error: '이 리소스를 볼 권한이 없습니다.' },
        { status: 403 },
      );
    }

    try {
      const signed = await createStorageSignedUrl(
        supabase,
        bucket,
        path,
        SIGNED_URL_EXPIRES_IN,
      );

      // driverId는 감사 로그 목적 등으로 사용할 수 있으나, 현재 요구사항상 필수는 아님
      void supabase
        .from('audit_logs')
        .insert({
          profile_id: user.id,
          vehicle_id: vehicleId,
          action:
            bucket === 'driver-photos'
              ? 'view_driver_photo'
              : 'view_vehicle_photo',
        })
        .then(() => {})
        .catch(() => {});

      return NextResponse.json({
        signed_url: signed.signed_url,
        expires_in: signed.expires_in,
      });
    } catch {
      return NextResponse.json(
        { error: '서명 URL을 생성하는 중 오류가 발생했습니다.' },
        { status: 500 },
      );
    }
  } catch {
    return NextResponse.json(
      { error: '요청을 처리하는 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

