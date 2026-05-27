import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getProfileByEmail } from "@/lib/auth/profile-by-email";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().trim().email("올바른 이메일 형식이 아닙니다."),
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

  const email = parsed.data.email;
  const { profile, lookupUnavailable } = await getProfileByEmail(email);

  if (!lookupUnavailable) {
    if (!profile) {
      return NextResponse.json({
        data: {
          hasAccount: false,
          message: "등록된 계정이 없습니다. 신규 가입을 신청하시면 관리자 승인 후 이용할 수 있습니다.",
        },
      });
    }

    if (!profile.is_active) {
      return NextResponse.json(
        {
          error: "관리자 승인 대기 중인 계정입니다. 승인 후 다시 시도하거나 관리자에게 문의해 주세요.",
        },
        { status: 400 },
      );
    }
  }

  const origin = request.headers.get("origin") ?? request.nextUrl.origin;
  const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent("/login/reset-password")}`;

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

  if (error) {
    return NextResponse.json(
      { error: "비밀번호 재설정 메일 발송에 실패했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    data: {
      hasAccount: true,
      message:
        "비밀번호 재설정 링크를 이메일로 보냈습니다. 메일함(스팸함 포함)을 확인한 뒤 링크를 눌러 새 비밀번호를 설정해 주세요.",
    },
  });
}
