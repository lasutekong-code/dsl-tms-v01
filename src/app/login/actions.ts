"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRedirectPathForRole, isProfileRole } from "@/lib/auth/role-redirect";
import {
  PROFILE_COLUMNS,
  type ProfileRole,
} from "@/types/database";

export type LoginState = {
  error?: string;
};

const INACTIVE_MESSAGE =
  "비활성화된 계정입니다. 관리자에게 문의하십시오.";

export async function signIn(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 입력해 주세요." };
  }

  const supabase = await createClient();
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({ email, password });

  if (authError || !authData.user) {
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profileError || !profile) {
    await supabase.auth.signOut();
    return {
      error: "등록된 프로필이 없습니다. 관리자에게 문의하세요.",
    };
  }

  if (!isProfileRole(profile.role)) {
    await supabase.auth.signOut();
    return { error: "유효하지 않은 계정 역할입니다. 관리자에게 문의하세요." };
  }

  if (!profile.is_active) {
    await supabase.auth.signOut();
    return { error: INACTIVE_MESSAGE };
  }

  const role = profile.role as ProfileRole;
  redirect(getRedirectPathForRole(role));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
