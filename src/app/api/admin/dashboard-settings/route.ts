import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getAdminOrResponse } from "@/lib/admin/api-guard";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const SETTINGS_ID = "default";

const updateSchema = z.object({
  quick_guide: z.string().min(1, "빠른 안내 내용을 입력해 주세요."),
  photo_guide: z.string().min(1, "사진 안내 내용을 입력해 주세요."),
});

export async function GET() {
  const gate = await getAdminOrResponse();
  if (!gate.ok) {
    return gate.response;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.from("admin_dashboard_settings").select("*").eq("id", SETTINGS_ID).maybeSingle();

  if (error) {
    return NextResponse.json({ error: "대시보드 설정을 불러오지 못했습니다." }, { status: 500 });
  }

  return NextResponse.json({
    data: data ?? {
      id: SETTINGS_ID,
      quick_guide: "",
      photo_guide: "",
      updated_at: null,
      updated_by: null,
    },
  });
}

export async function PATCH(request: NextRequest) {
  const gate = await getAdminOrResponse();
  if (!gate.ok) {
    return gate.response;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON 본문이 필요합니다." }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("admin_dashboard_settings")
    .upsert({
      id: SETTINGS_ID,
      quick_guide: parsed.data.quick_guide.trim(),
      photo_guide: parsed.data.photo_guide.trim(),
      updated_at: new Date().toISOString(),
      updated_by: gate.admin.profileId,
    })
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "저장에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({ data });
}
