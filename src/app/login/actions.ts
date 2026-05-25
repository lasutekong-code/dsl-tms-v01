"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { canAccessApp } from "@/lib/auth/roles";
import type { UserRole } from "@/types/database";

export type LoginState = {
  error?: string;
};

export async function signIn(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirect") ?? "/").trim() || "/";

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 입력해 주세요." };
  }

  const supabase = await createClient();
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({ email, password });

  if (authError || !authData.user) {
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }

  const { data: appUser, error: userError } = await supabase
    .from("users")
    .select("role, is_active")
    .eq("auth_user_id", authData.user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (userError || !appUser) {
    await supabase.auth.signOut();
    return {
      error: "등록된 업무 계정이 없습니다. 관리자에게 문의하세요.",
    };
  }

  const role = appUser.role as UserRole;

  if (!appUser.is_active || !canAccessApp(role)) {
    await supabase.auth.signOut();
    return { error: "접근 권한이 없거나 비활성 계정입니다." };
  }

  redirect(redirectTo.startsWith("/") ? redirectTo : "/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
