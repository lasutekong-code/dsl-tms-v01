import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import {
  buildVehicleSearchFilter,
  getAccessScope,
  normalizeSearchQuery,
  parseUserRole,
  recordSearchLog,
  resolveCanViewSensitive,
  SEARCH_SELECT_COLUMNS,
  toVehicleSearchResult,
} from "@/lib/vehicles/search-api";
import type { VehicleCardViewRow, VehicleSearchResult } from "@/types/vehicle";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const q = normalizeSearchQuery(request.nextUrl.searchParams.get("q"));

    if (!q) {
      return NextResponse.json({ error: "검색어가 필요합니다." }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role, is_active")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json({ error: "프로필을 불러오지 못했습니다." }, { status: 500 });
    }

    if (!profile || profile.is_active === false) {
      return NextResponse.json({ error: "비활성화된 계정입니다." }, { status: 403 });
    }

    const role = parseUserRole(profile.role);

    if (!role) {
      return NextResponse.json({ error: "허용되지 않은 역할입니다." }, { status: 403 });
    }

    const scope = await getAccessScope(supabase, user.id, role);

    if (scope.kind === "clients" && scope.clientIds.length === 0) {
      await recordSearchLog(supabase, user.id, q, 0);
      return NextResponse.json<VehicleSearchResult[]>([]);
    }

    if (scope.kind === "vehicles" && scope.vehicleIds.length === 0) {
      await recordSearchLog(supabase, user.id, q, 0);
      return NextResponse.json<VehicleSearchResult[]>([]);
    }

    let query = supabase
      .from("vehicle_card_view")
      .select(SEARCH_SELECT_COLUMNS)
      .or(buildVehicleSearchFilter(q));

    if (scope.kind === "clients") {
      query = query.in("client_id", scope.clientIds);
    }

    if (scope.kind === "vehicles") {
      query = query.in("vehicle_id", scope.vehicleIds);
    }

    const { data, error: searchError } = await query;

    if (searchError) {
      console.error("vehicle search failed", searchError);
      return NextResponse.json({ error: "차량 검색에 실패했습니다." }, { status: 500 });
    }

    const results = ((data ?? []) as VehicleCardViewRow[]).map((row) =>
      toVehicleSearchResult(row, resolveCanViewSensitive(row, scope)),
    );

    await recordSearchLog(supabase, user.id, q, results.length);

    return NextResponse.json<VehicleSearchResult[]>(results);
  } catch (error) {
    console.error("/api/vehicles/search failed", error);
    return NextResponse.json({ error: "검색 중 오류가 발생했습니다." }, { status: 500 });
  }
}
