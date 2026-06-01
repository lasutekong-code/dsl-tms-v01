import { NextRequest, NextResponse } from "next/server";

export type ParsedContractRequest = {
  body: unknown;
  file: File | null;
};

export async function parseContractRequest(
  request: NextRequest,
): Promise<{ ok: true; data: ParsedContractRequest } | { ok: false; response: NextResponse }> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return {
        ok: false,
        response: NextResponse.json(
          { error: "계약서 파일 업로드 형식이 올바르지 않습니다. 파일을 다시 선택해 주세요." },
          { status: 400 },
        ),
      };
    }

    const payload = form.get("payload");
    if (typeof payload !== "string" || !payload.trim()) {
      return {
        ok: false,
        response: NextResponse.json({ error: "저장할 계약 정보가 없습니다." }, { status: 400 }),
      };
    }

    let body: unknown;
    try {
      body = JSON.parse(payload);
    } catch {
      return {
        ok: false,
        response: NextResponse.json({ error: "계약 정보 형식이 올바르지 않습니다." }, { status: 400 }),
      };
    }

    const fileEntry = form.get("file");
    const file =
      fileEntry instanceof File && fileEntry.size > 0
        ? fileEntry
        : fileEntry instanceof Blob && fileEntry.size > 0
          ? new File([fileEntry], "contract-file")
          : null;

    return { ok: true, data: { body, file } };
  }

  try {
    const body = await request.json();
    return { ok: true, data: { body, file: null } };
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "JSON 본문이 필요합니다." }, { status: 400 }),
    };
  }
}
