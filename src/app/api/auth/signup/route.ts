import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import { isUserRole } from "@/lib/auth/login-roles";
import { getSupabaseConfig } from "@/lib/supabase/config";
import type { Database } from "@/types/database";

export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().trim().email("올바른 이메일(아이디) 형식이 아닙니다."),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다."),
  name: z.string().trim().min(1, "이름을 입력해 주세요."),
  phone: z.string().trim().optional(),
  role: z.string().refine(isUserRole, "역할을 선택해 주세요."),
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

  const { email, password, name, phone, role } = parsed.data;

  if (role === "admin") {
    return NextResponse.json(
      { error: "관리자 계정은 공개 가입으로 만들 수 없습니다. 시스템 관리자에게 계정 생성을 요청해 주세요." },
      { status: 400 },
    );
  }

  const { anonKey, url } = getSupabaseConfig();
  const supabase = createSupabaseClient<Database>(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });

  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role, phone: phone ?? null },
    },
  });

  if (signUpError) {
    const msg = signUpError.message.includes("already registered")
      ? "이미 등록된 아이디(이메일)입니다. 로그인하거나 비밀번호 찾기를 이용해 주세요."
      : "회원가입에 실패했습니다. 입력 정보를 확인해 주세요.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const userId = authData.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "계정 생성에 실패했습니다." }, { status: 500 });
  }

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: userId,
      role,
      name,
      email,
      phone: phone?.trim() ? phone.trim() : null,
      is_active: false,
    },
    { onConflict: "id" },
  );

  if (profileError) {
    return NextResponse.json({ error: "프로필 저장에 실패했습니다. 관리자에게 문의해 주세요." }, { status: 500 });
  }

  await supabase.from("account_requests").insert({
    request_type: "signup",
    email,
    login_id: email,
    name,
    phone: phone?.trim() ? phone.trim() : null,
    role,
    status: "pending",
    profile_id: userId,
    message: "신규 가입 승인 대기",
  });

  return NextResponse.json({
    data: {
      message: "가입 신청이 접수되었습니다. 관리자 승인 후 로그인할 수 있습니다.",
      userId,
    },
  });
}
