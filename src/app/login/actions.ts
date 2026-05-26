"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchProfileByUserId } from "@/lib/auth/fetch-profile";
import { getRedirectPathForRole } from "@/lib/auth/role-redirect";
import { INACTIVE_MESSAGE } from "@/lib/auth/messages";

export type LoginState = {
  error?: string;
};

const PROFILE_ERROR_MESSAGES: Record<
  "not_found" | "invalid_role" | "db_error",
  string
> = {
  not_found: "등록된 프로필이 없습니다. 관리자에게 문의하세요.",
  invalid_role: "유효하지 않은 계정 역할입니다. 관리자에게 문의하세요.",
  db_error: "프로필을 불러오지 못했습니다. 잠시 후 다시 시도하세요.",
};

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

  const profileResult = await fetchProfileByUserId(supabase, authData.user.id);

  if (!profileResult.ok) {
    await supabase.auth.signOut();
    return { error: PROFILE_ERROR_MESSAGES[profileResult.reason] };
  }

  const { profile } = profileResult;

  if (!profile.is_active) {
    await supabase.auth.signOut();
    return { error: INACTIVE_MESSAGE };
  }

  redirect(getRedirectPathForRole(profile.role));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
