import { NextRequest, NextResponse } from "next/server";

import { insertAuditLog } from "@/lib/admin/audit-log";
import { getAdminOrResponse } from "@/lib/admin/api-guard";
import { validatePhotoFile } from "@/lib/admin/photo-file";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/vehicles/build-detail";

export const dynamic = "force-dynamic";

const BUCKET = "driver-photos";

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

  const driverId = String(form.get("driverId") ?? "").trim();
  const file = form.get("file");

  if (!isUuid(driverId)) {
    return NextResponse.json({ error: "운전자 ID가 올바르지 않습니다." }, { status: 400 });
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
