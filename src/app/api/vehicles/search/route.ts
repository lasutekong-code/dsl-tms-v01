import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

import { parseUserRole } from "@/lib/permissions/vehicle-access";
import { createClient } from "@/lib/supabase/server";
import { maskPhone } from "@/lib/utils/mask-sensitive";
import type { Database } from "@/types/database";
import type {
  ClientAccessRow,
  UserRole,
  VehicleAccessRow,
  VehicleCardRow,
} from "@/types/vehicle";

export const dynamic = "force-dynamic";

type AppSupabaseClient = SupabaseClient<Database>;

type AccessScope =
  | { kind: "all"; role: UserRole }
  | {
      kind: "clients";
      role: UserRole;
      clientIds: string[];
      canViewSensitiveByClientId: Map<string, boolean>;
    }
  | {
      kind: "vehicles";
      role: UserRole;
      vehicleIds: string[];
      canViewSensitiveByVehicleId: Map<string, boolean>;
    };

const SEARCHABLE_COLUMNS = ["client_name", "vehicle_no", "driver_name"] as const;
const VEHICLE_PHOTO_BUCKET = "vehicle-photos";
const DRIVER_PHOTO_BUCKET = "driver-photos";
const VEHICLE_PHOTO_ORDER = ["front", "side", "rear"] as const;

type PhotoRef = { bucket: string; path: string };

type SearchPhotoMaps = {
  photosByVehicle: Map<string, PhotoRef[]>;
  driverPhotoByDriver: Map<string, PhotoRef>;
};

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim().slice(0, 100) ?? "";

  if (!q) {
    return NextResponse.json({ results: [] });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile || profile.is_active === false) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const role = parseUserRole(profile.role);

  if (!role) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const scope = await getAccessScope(supabase, profile.id, role);

  if (scope.kind === "clients" && scope.clientIds.length === 0) {
    return NextResponse.json({ results: [] });
  }

  if (scope.kind === "vehicles" && scope.vehicleIds.length === 0) {
    return NextResponse.json({ results: [] });
  }

  const pattern = quotePostgrestValue(`%${escapePostgresLikePattern(q)}%`);
  let query = supabase
    .from("vehicle_card_view")
    .select("*")
    .or(SEARCHABLE_COLUMNS.map((column) => `${column}.ilike.${pattern}`).join(","));

  if (scope.kind === "clients") {
    query = query.in("client_id", scope.clientIds);
  }

  if (scope.kind === "vehicles") {
    query = query.in("vehicle_id", scope.vehicleIds);
  }

  const { data, error } = await query.limit(50);

  if (error) {
    return NextResponse.json({ error: "Vehicle search failed." }, { status: 500 });
  }

  const rows = data ?? [];
  const duplicateVehicleIds = new Set<string>();
  const seenVehicleIds = new Set<string>();
  for (const row of rows) {
    const vehicleId = String(row.vehicle_id);
    if (seenVehicleIds.has(vehicleId)) {
      duplicateVehicleIds.add(vehicleId);
    }
    seenVehicleIds.add(vehicleId);
  }

  const photoMaps = await loadSearchPhotoMaps(supabase, rows);
  const results = rows.map((row, index) =>
    mapSearchResult(row, role, scope, index, duplicateVehicleIds, photoMaps),
  );

  await supabase.from("search_logs").insert({ user_id: user.id, query: q });

  return NextResponse.json({
    results,
    duplicateVehicleCount: duplicateVehicleIds.size,
  });
}

async function getAccessScope(
  supabase: AppSupabaseClient,
  userId: string,
  role: UserRole,
): Promise<AccessScope> {
  if (role === "admin") {
    return { kind: "all", role };
  }

  if (role === "client_manager") {
    const { data, error } = await supabase
      .from("user_client_access")
      .select("client_id, can_view_sensitive")
      .eq("user_id", userId);

    if (error) {
      throw new Error(error.message);
    }

    const rows = (data ?? []) as ClientAccessRow[];

    return {
      kind: "clients",
      role,
      clientIds: rows.map((row) => row.client_id),
      canViewSensitiveByClientId: new Map(
        rows.map((row) => [row.client_id, row.can_view_sensitive === true]),
      ),
    };
  }

  const { data, error } = await supabase
    .from("user_vehicle_access")
    .select("vehicle_id, can_view_sensitive")
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as VehicleAccessRow[];

  return {
    kind: "vehicles",
    role,
    vehicleIds: rows.map((row) => row.vehicle_id),
    canViewSensitiveByVehicleId: new Map(
      rows.map((row) => [row.vehicle_id, row.can_view_sensitive === true]),
    ),
  };
}

async function loadSearchPhotoMaps(supabase: AppSupabaseClient, rows: VehicleCardRow[]): Promise<SearchPhotoMaps> {
  const vehicleIds = [...new Set(rows.map((row) => String(row.vehicle_id)))];
  const driverIds = [
    ...new Set(rows.map((row) => row.driver_id).filter(Boolean).map((id) => String(id))),
  ];

  const [{ data: vehiclePhotos }, { data: driverPhotos }] = await Promise.all([
    vehicleIds.length > 0
      ? supabase.from("vehicle_photos").select("vehicle_id, photo_type, storage_path").in("vehicle_id", vehicleIds)
      : Promise.resolve({ data: [] as { vehicle_id: string; photo_type: string; storage_path: string }[] }),
    driverIds.length > 0
      ? supabase.from("driver_photos").select("driver_id, storage_path").in("driver_id", driverIds)
      : Promise.resolve({ data: [] as { driver_id: string; storage_path: string }[] }),
  ]);

  const grouped = new Map<string, { photo_type: string; bucket: string; path: string }[]>();
  for (const photo of vehiclePhotos ?? []) {
    const list = grouped.get(photo.vehicle_id) ?? [];
    list.push({ photo_type: photo.photo_type, bucket: VEHICLE_PHOTO_BUCKET, path: photo.storage_path });
    grouped.set(photo.vehicle_id, list);
  }

  const photosByVehicle = new Map<string, PhotoRef[]>();
  for (const [vehicleId, list] of grouped) {
    const sorted = [...list].sort(
      (a, b) => VEHICLE_PHOTO_ORDER.indexOf(a.photo_type as (typeof VEHICLE_PHOTO_ORDER)[number]) -
        VEHICLE_PHOTO_ORDER.indexOf(b.photo_type as (typeof VEHICLE_PHOTO_ORDER)[number]),
    );
    photosByVehicle.set(
      vehicleId,
      sorted.slice(0, 3).map((photo) => ({ bucket: photo.bucket, path: photo.path })),
    );
  }

  const driverPhotoByDriver = new Map<string, PhotoRef>();
  for (const photo of driverPhotos ?? []) {
    driverPhotoByDriver.set(photo.driver_id, { bucket: DRIVER_PHOTO_BUCKET, path: photo.storage_path });
  }

  return { photosByVehicle, driverPhotoByDriver };
}

function mapSearchResult(
  row: VehicleCardRow,
  role: UserRole,
  scope: AccessScope,
  index: number,
  duplicateVehicleIds: Set<string>,
  photoMaps: SearchPhotoMaps,
) {
  const vehicleId = String(row.vehicle_id);
  const canViewSensitive =
    role === "admin" ||
    (scope.kind === "vehicles" &&
      scope.canViewSensitiveByVehicleId.get(vehicleId) === true);

  const driverPhone =
    canViewSensitive && role !== "client_manager"
      ? (typeof row.driver_phone === "string" ? row.driver_phone : null)
      : maskPhone(typeof row.driver_phone === "string" ? row.driver_phone : null);

  return {
    id: vehicleId,
    rowKey: `${vehicleId}-${String(row.client_id ?? "no-client")}-${index}`,
    isDuplicatedVehicle: duplicateVehicleIds.has(vehicleId),
    plateNumber: String(row.vehicle_no ?? "-"),
    vehicleNumber: typeof row.vehicle_no === "string" ? row.vehicle_no : null,
    vehicleType: typeof row.car_name === "string" ? row.car_name : null,
    clientName: typeof row.client_name === "string" ? row.client_name : null,
    centerName: typeof row.center_name === "string" ? row.center_name : null,
    driverId: row.driver_id ? String(row.driver_id) : null,
    driverName: typeof row.driver_name === "string" ? row.driver_name : null,
    driverPhone,
    vehiclePhotos: photoMaps.photosByVehicle.get(vehicleId) ?? [],
    driverPhoto: row.driver_id
      ? (photoMaps.driverPhotoByDriver.get(String(row.driver_id)) ?? null)
      : null,
  };
}

function escapePostgresLikePattern(value: string) {
  return value.replace(/[\\%_]/g, (character) => `\\${character}`);
}

function quotePostgrestValue(value: string) {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}
