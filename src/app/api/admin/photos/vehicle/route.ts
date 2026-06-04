import { NextRequest, NextResponse } from "next/server";

import { insertAuditLog } from "@/lib/admin/audit-log";
import { getAdminOrResponse } from "@/lib/admin/api-guard";
import { validatePhotoFile } from "@/lib/admin/photo-file";
import { removeAdminStorageObject, uploadAdminStorageObject } from "@/lib/admin/storage-upload";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/vehicles/build-detail";

export const dynamic = "force-dynamic";

const BUCKET = "vehicle-photos";
const PHOTO_TYPES = new Set(["front", "rear", "side"]);

function extForMime(mime: string, fileName: string) {
  const fromName = fileName.split(".").pop()?.toLowerCase();
  if (fromName === "png" || mime === "image/png") {
    return "png";
  }

  if (fromName === "webp" || mime === "image/webp") {
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

  const vehicleId = String(form.get("vehicleId") ?? "").trim();
  const photoType = String(form.get("photoType") ?? "").trim();
  const file = form.get("file");

  if (!isUuid(vehicleId)) {
    return NextResponse.json({ error: "차량 ID가 올바르지 않습니다." }, { status: 400 });
  }

  if (!PHOTO_TYPES.has(photoType)) {
    return NextResponse.json({ error: "사진 유형이 올바르지 않습니다." }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "파일이 필요합니다." }, { status: 400 });
  }

  const fileError = validatePhotoFile(file);
  if (fileError) {
    return NextResponse.json({ error: fileError }, { status: 400 });
  }

  const mime = file.type || "application/octet-stream";
  const ext = extForMime(mime, file.name);
  const storagePath = `${vehicleId}/${photoType}.${ext}`;

  const supabase = await createClient();
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await uploadAdminStorageObject(BUCKET, storagePath, buffer, mime);
  if (uploadError) {
    return NextResponse.json({ error: "스토리지 업로드에 실패했습니다." }, { status: 500 });
  }

  const { data: existing } = await supabase
    .from("vehicle_photos")
    .select("id")
    .eq("vehicle_id", vehicleId)
    .eq("photo_type", photoType)
    .maybeSingle();

  const row = {
    vehicle_id: vehicleId,
    photo_type: photoType,
    storage_path: storagePath,
    uploaded_by: gate.admin.profileId,
  };

  const op = existing?.id
    ? supabase.from("vehicle_photos").update(row).eq("id", existing.id).select("*").maybeSingle()
    : supabase.from("vehicle_photos").insert(row).select("*").single();

  const { data, error } = await op;

  if (error || !data) {
    return NextResponse.json({ error: "DB 저장에 실패했습니다." }, { status: 500 });
  }

  await insertAuditLog(supabase, {
    profileId: gate.admin.profileId,
    userId: gate.admin.userId,
    action: "vehicle_photo.upload",
    targetTable: "vehicle_photos",
    targetId: data.id,
    vehicleId,
    metadata: { photo_type: photoType },
  });

  return NextResponse.json({ data });
}

export async function DELETE(request: NextRequest) {
  const gate = await getAdminOrResponse();
  if (!gate.ok) {
    return gate.response;
  }

  let body: { vehicleId?: string; photoType?: string };
  try {
    body = (await request.json()) as { vehicleId?: string; photoType?: string };
  } catch {
    return NextResponse.json({ error: "JSON body가 필요합니다." }, { status: 400 });
  }

  const vehicleId = String(body.vehicleId ?? "").trim();
  const photoType = String(body.photoType ?? "").trim();

  if (!isUuid(vehicleId)) {
    return NextResponse.json({ error: "차량 ID가 올바르지 않습니다." }, { status: 400 });
  }

  if (!PHOTO_TYPES.has(photoType)) {
    return NextResponse.json({ error: "사진 유형이 올바르지 않습니다." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("vehicle_photos")
    .select("id, storage_path")
    .eq("vehicle_id", vehicleId)
    .eq("photo_type", photoType)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "등록된 사진이 없습니다." }, { status: 404 });
  }

  if (existing.storage_path) {
    await removeAdminStorageObject(BUCKET, existing.storage_path);
  }

  const { error } = await supabase.from("vehicle_photos").delete().eq("id", existing.id);
  if (error) {
    return NextResponse.json({ error: "사진 삭제에 실패했습니다." }, { status: 500 });
  }

  await insertAuditLog(supabase, {
    profileId: gate.admin.profileId,
    userId: gate.admin.userId,
    action: "vehicle_photo.delete",
    targetTable: "vehicle_photos",
    targetId: existing.id,
    vehicleId,
    metadata: { photo_type: photoType },
  });

  return NextResponse.json({ ok: true });
}
