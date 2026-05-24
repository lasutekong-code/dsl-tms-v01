import { NextRequest, NextResponse } from "next/server";

import { getProfile } from "@/lib/auth/get-profile";
import { canViewVehicle } from "@/lib/permissions/can-view-vehicle";
import { createClient } from "@/lib/supabase/server";
import { maskPhone } from "@/lib/utils/mask-sensitive";

type VehicleRow = {
  id: string;
  plate_number: string;
  vehicle_number: string | null;
  vehicle_type: string | null;
};

type AssignmentRow = {
  vehicle_id: string;
  driver_id: string | null;
  clients?: { name: string | null } | null;
  centers?: { name: string | null } | null;
  drivers?: { id: string; name: string | null; phone: string | null } | null;
};

type VehiclePhotoRow = {
  vehicle_id: string;
  bucket: string | null;
  storage_path: string;
  sort_order: number | null;
};

type DriverPhotoRow = {
  driver_id: string;
  bucket: string | null;
  storage_path: string;
};

function unique(values: Array<string | null | undefined>) {
  return [...new Set(values.filter(Boolean) as string[])];
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json({ results: [] });
  }

  const supabase = (await createClient()) as ReturnType<typeof createClient> extends Promise<infer T> ? T : never;
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await getProfile(user.id);

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 403 });
  }

  await supabase.from("search_logs").insert({ user_id: user.id, query: q });

  const pattern = `%${q}%`;
  const [vehicleMatches, clientMatches, driverMatches] = await Promise.all([
    supabase
      .from("vehicles")
      .select("id")
      .or(`plate_number.ilike.${pattern},vehicle_number.ilike.${pattern}`)
      .limit(50),
    supabase
      .from("vehicle_assignments")
      .select("vehicle_id, clients!inner(name)")
      .ilike("clients.name", pattern)
      .limit(50),
    supabase
      .from("vehicle_assignments")
      .select("vehicle_id, drivers!inner(name)")
      .ilike("drivers.name", pattern)
      .limit(50)
  ]);

  const vehicleIds = unique([
    ...((vehicleMatches.data ?? []) as Array<{ id: string }>).map((item) => item.id),
    ...((clientMatches.data ?? []) as Array<{ vehicle_id: string }>).map((item) => item.vehicle_id),
    ...((driverMatches.data ?? []) as Array<{ vehicle_id: string }>).map((item) => item.vehicle_id)
  ]);

  if (vehicleIds.length === 0) {
    return NextResponse.json({ results: [] });
  }

  const allowedVehicleIds = [];

  for (const vehicleId of vehicleIds) {
    if (await canViewVehicle(profile, vehicleId)) {
      allowedVehicleIds.push(vehicleId);
    }
  }

  if (allowedVehicleIds.length === 0) {
    return NextResponse.json({ results: [] });
  }

  const [vehiclesResult, assignmentsResult, photosResult] = await Promise.all([
    supabase
      .from("vehicles")
      .select("id, plate_number, vehicle_number, vehicle_type")
      .in("id", allowedVehicleIds)
      .limit(50),
    supabase
      .from("vehicle_assignments")
      .select("vehicle_id, driver_id, clients(name), centers(name), drivers(id, name, phone)")
      .in("vehicle_id", allowedVehicleIds),
    supabase
      .from("vehicle_photos")
      .select("vehicle_id, bucket, storage_path, sort_order")
      .in("vehicle_id", allowedVehicleIds)
      .order("sort_order", { ascending: true })
  ]);

  const vehicles = (vehiclesResult.data ?? []) as VehicleRow[];
  const assignments = (assignmentsResult.data ?? []) as AssignmentRow[];
  const vehiclePhotos = (photosResult.data ?? []) as VehiclePhotoRow[];
  const driverIds = unique(assignments.map((assignment) => assignment.driver_id));
  const driverPhotosResult =
    driverIds.length > 0
      ? await supabase.from("driver_photos").select("driver_id, bucket, storage_path").in("driver_id", driverIds)
      : { data: [] };
  const driverPhotos = (driverPhotosResult.data ?? []) as DriverPhotoRow[];

  const results = vehicles.map((vehicle) => {
    const assignment = assignments.find((item) => item.vehicle_id === vehicle.id);
    const driverPhoto = assignment?.driver_id
      ? driverPhotos.find((photo) => photo.driver_id === assignment.driver_id)
      : null;

    return {
      id: vehicle.id,
      plateNumber: vehicle.plate_number,
      vehicleNumber: vehicle.vehicle_number,
      vehicleType: vehicle.vehicle_type,
      clientName: assignment?.clients?.name ?? null,
      centerName: assignment?.centers?.name ?? null,
      driverId: assignment?.drivers?.id ?? assignment?.driver_id ?? null,
      driverName: assignment?.drivers?.name ?? null,
      driverPhone: profile.role === "admin" ? (assignment?.drivers?.phone ?? null) : maskPhone(assignment?.drivers?.phone),
      vehiclePhotos: vehiclePhotos
        .filter((photo) => photo.vehicle_id === vehicle.id)
        .slice(0, 3)
        .map((photo) => ({
          bucket: photo.bucket ?? "vehicle-photos",
          path: photo.storage_path
        })),
      driverPhoto: driverPhoto
        ? {
            bucket: driverPhoto.bucket ?? "driver-photos",
            path: driverPhoto.storage_path
          }
        : null
    };
  });

  return NextResponse.json({ results });
}
