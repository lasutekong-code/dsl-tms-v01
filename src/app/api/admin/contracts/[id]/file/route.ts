import { NextRequest, NextResponse } from "next/server";

import { getAdminOrResponse } from "@/lib/admin/api-guard";
import { deleteContractFile, getUploadFileFromForm, uploadContractFile } from "@/lib/admin/contract-file";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/vehicles/build-detail";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const gate = await getAdminOrResponse();
  if (!gate.ok) {
    return gate.response;
  }

  const { id } = await context.params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "잘못된 ID입니다." }, { status: 400 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ error: "파일 업로드는 multipart 형식이어야 합니다." }, { status: 400 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "계약서 파일을 읽을 수 없습니다. 파일을 다시 선택한 뒤 저장해 주세요." },
      { status: 400 },
    );
  }

  const file = getUploadFileFromForm(form);
  if (!file) {
    return NextResponse.json({ error: "파일을 선택해 주세요." }, { status: 400 });
  }

  const supabase = await createClient();
  const result = await uploadContractFile(supabase, id, file, gate.admin);
  if ("error" in result && result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ data: result.data });
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
  const result = await deleteContractFile(supabase, id, gate.admin);
  if ("error" in result && result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status ?? 500 });
  }

  return NextResponse.json({ data: result.data });
}
