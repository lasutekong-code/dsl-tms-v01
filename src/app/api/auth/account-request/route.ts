import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { isUserRole } from "@/lib/auth/login-roles";
import { getProfileByEmail } from "@/lib/auth/profile-by-email";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const schema = z.object({
  request_type: z.enum(["find_id", "find_password"]),
  email: z.string().trim().email("올바른 이메일 형식이 아닙니다."),
  name: z.string().trim().min(1, "이름을 입력해 주세요."),
  phone: z.string().trim().optional(),
  role: z.string().optional(),
  login_id: z.string().trim().optional(),
  message: z.string().trim().optional(),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON 본문이 필요합니다." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요." },
      { status: 400 },
    );
  }

  const role = parsed.data.role?.trim();
  if (role && !isUserRole(role)) {
    return NextResponse.json({ error: "역할 값이 올바르지 않습니다." }, { status: 400 });
  }

  const supabase = await createClient();
  const { profile } = await getProfileByEmail(parsed.data.email);

  const requestMessage =
    parsed.data.message?.trim() ||
    (parsed.data.request_type === "find_id"
      ? "아이디 찾기 요청 — 계정이 없으면 신규 가입 승인 요청으로 처리"
      : "비밀번호 찾기 요청 — 계정이 없으면 신규 가입 승인 요청으로 처리");

  const { data, error } = await supabase
    .from("account_requests")
    .insert({
      request_type: parsed.data.request_type,
      email: parsed.data.email,
      name: parsed.data.name,
      phone: parsed.data.phone?.trim() ? parsed.data.phone.trim() : null,
      role: role ?? null,
      login_id: parsed.data.login_id?.trim() || parsed.data.email,
      message: profile
        ? `${requestMessage} (등록된 계정 있음, is_active=${profile.is_active})`
        : `${requestMessage} (등록된 계정 없음 → 신규가입 검토)`,
      status: "pending",
      profile_id: profile?.id ?? null,
    })
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "요청 접수에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({
    data: {
      id: data.id,
      hasAccount: Boolean(profile),
      message: profile
        ? "요청이 접수되었습니다. 관리자 확인 후 연락드립니다."
        : "등록된 계정이 없습니다. 신규 가입을 신청하시면 관리자 승인 후 이용할 수 있습니다.",
    },
  });
}
