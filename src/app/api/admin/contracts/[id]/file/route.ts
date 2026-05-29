import { NextRequest, NextResponse } from "next/server";

import { insertAuditLog } from "@/lib/admin/audit-log";
import { getAdminOrResponse } from "@/lib/admin/api-guard";
import { removeAdminStorageObject, uploadAdminStorageObject } from "@/lib/admin/storage-upload";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/vehicles/build-detail";

export const dynamic = "force-dynamic";

const BUCKET = "contract-files";
const ALLOWED_EXTENSIONS = new Set(["pdf", "docx", "hwpx", "txt"]);

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const gate = await getAdminOrResponse();
  if (!gate.ok) {
    return gate.response;
  }

  const { id } = await context.params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "잘못된 ID입니다." }, { status: 400 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "multipart 폼이 필요합니다." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "파일을 선택해 주세요." }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return NextResponse.json({ error: "pdf, docx, hwpx, txt 파일만 업로드할 수 있습니다." }, { status: 400 });
  }

  const supabase = await createClient();
  const path = `${id}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await uploadAdminStorageObject(
    BUCKET,
    path,
    Buffer.from(await file.arrayBuffer()),
    file.type || "application/octet-stream",
  );
  if (uploadError) {
    return NextResponse.json({ error: "파일 업로드에 실패했습니다." }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("contracts")
    .update({
      contract_file_bucket: BUCKET,
      contract_file_path: path,
      contract_file_name: file.name,
      contract_file_mime: file.type || null,
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error || !data) {
    return NextResponse.json({ error: "파일 정보 저장에 실패했습니다." }, { status: 500 });
  }

  await insertAuditLog(supabase, {
    profileId: gate.admin.profileId,
    userId: gate.admin.userId,
    action: "contract.file.upload",
    targetTable: "contracts",
    targetId: id,
    vehicleId: data.vehicle_id,
    metadata: { file_name: file.name },
  });

  return NextResponse.json({ data });
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const gate = await getAdminOrResponse();
  if (!gate.ok) {
    return gate.response;
  }

  const { id } = await context.params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "잘못된 ID입니다." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("contracts")
    .select("id, vehicle_id, contract_file_bucket, contract_file_path")
    .eq("id", id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "계약을 찾을 수 없습니다." }, { status: 404 });
  }

  if (existing.contract_file_bucket && existing.contract_file_path) {
    await removeAdminStorageObject(existing.contract_file_bucket, existing.contract_file_path);
  }

  const { data, error } = await supabase
    .from("contracts")
    .update({
      contract_file_bucket: null,
      contract_file_path: null,
      contract_file_name: null,
      contract_file_mime: null,
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "첨부파일 삭제에 실패했습니다." }, { status: 500 });
  }

  await insertAuditLog(supabase, {
    profileId: gate.admin.profileId,
    userId: gate.admin.userId,
    action: "contract.file.delete",
    targetTable: "contracts",
    targetId: id,
    vehicleId: data.vehicle_id,
  });

  return NextResponse.json({ data });
}
