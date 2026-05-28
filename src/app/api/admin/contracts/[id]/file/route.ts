import { NextRequest, NextResponse } from "next/server";

import { insertAuditLog } from "@/lib/admin/audit-log";
import { getAdminOrResponse } from "@/lib/admin/api-guard";
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

  const form = await request.formData();
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
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, Buffer.from(await file.arrayBuffer()), {
    upsert: true,
    contentType: file.type || "application/octet-stream",
  });
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
