import { NextRequest, NextResponse } from "next/server";

import { insertAuditLog } from "@/lib/admin/audit-log";
import { getAdminOrResponse } from "@/lib/admin/api-guard";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/vehicles/build-detail";

export const dynamic = "force-dynamic";

const BUCKET = "driver-photos";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function extForMime(mime: string) {
  if (mime === "image/png") {
    return "png";
  }

  if (mime === "image/webp") {
    return "webp";
  }

  return "jpg";
}

export async function POST(request: NextRequest) {
  const gate = await getAdminOrResponse();
  if (!gate.ok) {
    return gate.response;
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "multipart 폼이 필요합니다." }, { status: 400 });
  }

  const driverId = String(form.get("driverId") ?? "").trim();
  const file = form.get("file");

  if (!isUuid(driverId)) {
    return NextResponse.json({ error: "운전자 ID가 올바르지 않습니다." }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "파일이 필요합니다." }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "파일 크기는 5MB 이하여야 합니다." }, { status: 400 });
  }

  const mime = file.type || "application/octet-stream";
  if (!ALLOWED_TYPES.has(mime)) {
    return NextResponse.json({ error: "jpg, png, webp 이미지만 업로드할 수 있습니다." }, { status: 400 });
  }

  const ext = extForMime(mime);
  const storagePath = `${driverId}/profile.${ext}`;

  const supabase = await createClient();
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, buffer, {
    upsert: true,
    contentType: mime,
  });

  if (uploadError) {
    return NextResponse.json({ error: "스토리지 업로드에 실패했습니다." }, { status: 500 });
  }

  const { data: existing } = await supabase.from("driver_photos").select("id").eq("driver_id", driverId).maybeSingle();

  const row = {
    driver_id: driverId,
    bucket: BUCKET,
    storage_path: storagePath,
  };

  const op = existing?.id
    ? supabase.from("driver_photos").update(row).eq("id", existing.id).select("*").maybeSingle()
    : supabase.from("driver_photos").insert(row).select("*").single();

  const { data, error } = await op;

  if (error || !data) {
    return NextResponse.json({ error: "DB 저장에 실패했습니다." }, { status: 500 });
  }

  await insertAuditLog(supabase, {
    profileId: gate.admin.profileId,
    userId: gate.admin.userId,
    action: "driver_photo.upload",
    targetTable: "driver_photos",
    targetId: data.id,
    metadata: { driver_id: driverId },
  });

  return NextResponse.json({ data });
}
