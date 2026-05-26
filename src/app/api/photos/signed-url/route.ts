import { NextRequest, NextResponse } from "next/server";

import { isUuid } from "@/lib/vehicles/build-detail";
import {
  canAccessVehicle,
  parseUserRole,
} from "@/lib/permissions/vehicle-access";
import { createClient } from "@/lib/supabase/server";

const DEFAULT_EXPIRES_SECONDS = 600;

type SignedUrlRequest = {
  bucket?: string;
  path?: string;
  vehicleId?: string;
  expiresIn?: number;
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as SignedUrlRequest;
  const bucket = body.bucket?.trim();
  const path = body.path?.trim();
  const vehicleId = body.vehicleId?.trim();

  if (!bucket || !path) {
    return NextResponse.json({ error: "bucket and path are required." }, { status: 400 });
  }

  if (!vehicleId || !isUuid(vehicleId)) {
    return NextResponse.json({ error: "Valid vehicleId is required." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, is_active, full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.is_active === false) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const role = parseUserRole(profile.role);

  if (!role) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const allowed = await canAccessVehicle(supabase, profile, vehicleId);

  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const expiresIn = Math.min(Math.max(body.expiresIn ?? DEFAULT_EXPIRES_SECONDS, 300), 600);

  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: error?.message ?? "Failed to create signed URL." }, { status: 500 });
  }

  return NextResponse.json({ signedUrl: data.signedUrl, expiresIn });
}
