import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { insertAuditLog } from "@/lib/admin/audit-log";
import { getAdminOrResponse } from "@/lib/admin/api-guard";
import { flattenZodErrors, phoneOptionalSchema } from "@/lib/admin/zod-util";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  email: z.string().trim().email("올바른 이메일(아이디) 형식이 아닙니다."),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다."),
  name: z.string().trim().min(1, "이름을 입력해 주세요."),
  phone: phoneOptionalSchema,
  is_active: z.boolean().optional().default(true),
});

export async function POST(request: NextRequest) {
  const gate = await getAdminOrResponse();
  if (!gate.ok) {
    return gate.response;
  }

  const service = createServiceRoleClient();
  if (!service) {
    return NextResponse.json(
      {
        error:
          "서버에 SUPABASE_SERVICE_ROLE_KEY가 설정되어 있지 않습니다. 관리자 계정 생성 기능을 사용할 수 없습니다.",
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON 본문이 필요합니다." }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "입력값을 확인해 주세요.", fields: flattenZodErrors(parsed.error) },
      { status: 400 },
    );
  }

  const { email, password, name, phone, is_active } = parsed.data;

  const { data: created, error: createError } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role: "admin" },
  });

  if (createError) {
    const msg = createError.message.toLowerCase().includes("already")
      ? "이미 사용 중인 아이디(이메일)입니다."
      : "관리자 계정 생성에 실패했습니다.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const userId = created.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "계정 생성에 실패했습니다." }, { status: 500 });
  }

  const { data: profile, error: profileError } = await service
    .from("profiles")
    .upsert(
      {
        id: userId,
        role: "admin",
        name,
        email,
        phone: phone ?? null,
        is_active: is_active ?? true,
      },
      { onConflict: "id" },
    )
    .select("id, role, name, email, phone, is_active")
    .single();

  if (profileError || !profile) {
    await service.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: "프로필 저장에 실패했습니다." }, { status: 500 });
  }

  const sessionClient = await createClient();
  await insertAuditLog(sessionClient, {
    profileId: gate.admin.profileId,
    userId: gate.admin.userId,
    action: "update",
    targetTable: "profiles",
    targetId: userId,
    metadata: { type: "admin.create", email, name },
  });

  return NextResponse.json({
    data: {
      profile,
      message: "관리자 계정이 생성되었습니다. 생성된 아이디와 비밀번호로 로그인할 수 있습니다.",
    },
  });
}
