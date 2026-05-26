import { NextRequest, NextResponse } from "next/server";

import { getProfile } from "@/lib/auth/get-profile";
import { canViewVehicle } from "@/lib/permissions/can-view-vehicle";
import { createClient } from "@/lib/supabase/server";

type SignedUrlRequest = {
  bucket?: string;
  path?: string;
  vehicleId?: string;
  driverId?: string | null;
  expiresIn?: number;
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as SignedUrlRequest;
  const bucket = body.bucket?.trim();
  const path = body.path?.trim();

  if (!bucket || !path) {
    return NextResponse.json({ error: "bucket and path are required" }, { status: 400 });
  }

  const supabase = await createClient();
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

  let allowed = profile.role === "admin";

  if (!allowed && body.vehicleId) {
    allowed = await canViewVehicle(profile, body.vehicleId);
  }

  if (!allowed && body.driverId) {
    const { data: assignments } = await supabase
      .from("vehicle_assignments")
      .select("vehicle_id")
      .eq("driver_id", body.driverId)
      .limit(20);

    for (const assignment of assignments ?? []) {
      if (await canViewVehicle(profile, assignment.vehicle_id)) {
        allowed = true;
        break;
      }
    }
  }

  if (!allowed) {
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "photo_signed_url_denied",
      target_table: body.vehicleId ? "vehicles" : "photos",
      target_id: body.vehicleId ?? body.driverId ?? path,
      metadata: { bucket, path }
    });

    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await supabase.from("audit_logs").insert({
    user_id: user.id,
    action: "photo_signed_url_created",
    target_table: body.vehicleId ? "vehicles" : "photos",
    target_id: body.vehicleId ?? body.driverId ?? path,
    metadata: { bucket, path }
  });

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, Math.min(body.expiresIn ?? 300, 900));

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ signedUrl: data.signedUrl });
}
