import { NextRequest, NextResponse } from "next/server";

import { getAdminOrResponse } from "@/lib/admin/api-guard";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DEFAULT_EXPIRES = 600;

export async function POST(request: NextRequest) {
  const gate = await getAdminOrResponse();
  if (!gate.ok) {
    return gate.response;
  }

  let body: { bucket?: string; path?: string; expiresIn?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON 본문이 필요합니다." }, { status: 400 });
  }

  const bucket = body.bucket?.trim();
  const path = body.path?.trim();
  if (!bucket || !path) {
    return NextResponse.json({ error: "bucket과 path가 필요합니다." }, { status: 400 });
  }

  const expiresIn = Math.min(Math.max(body.expiresIn ?? DEFAULT_EXPIRES, 300), 3600);
  const service = createServiceRoleClient();
  const client = service ?? (await createClient());

  const { data, error } = await client.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: error?.message ?? "Signed URL 생성에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({ signedUrl: data.signedUrl, expiresIn });
}
