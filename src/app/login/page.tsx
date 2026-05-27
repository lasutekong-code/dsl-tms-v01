import { redirect } from "next/navigation";

import { LoginScreen } from "@/components/auth/login-screen";
import { getProfile, getRoleHomePath } from "@/lib/auth/get-profile";
import { isUserRole } from "@/lib/auth/login-roles";
import { createClient } from "@/lib/supabase/server";

function parseSafeNext(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return null;
  }

  return trimmed;
}

function errorMessage(code: string | undefined): string | null {
  switch (code) {
    case "missing":
      return "아이디와 비밀번호를 입력해 주세요.";
    case "invalid":
      return "아이디 또는 비밀번호가 올바르지 않습니다.";
    case "role_mismatch":
      return "선택한 역할과 계정 역할이 일치하지 않습니다.";
    case "pending":
      return "관리자 승인 대기 중입니다. 승인 후 다시 로그인해 주세요.";
    case "inactive":
      return "비활성화된 계정입니다. 관리자에게 문의해 주세요.";
    default:
      return null;
  }
}

function successMessage(code: string | undefined): string | null {
  switch (code) {
    case "signup_pending":
      return "가입 신청이 완료되었습니다. 관리자 승인 후 로그인할 수 있습니다.";
    case "request_submitted":
      return "요청이 접수되었습니다. 관리자 확인 후 안내드립니다.";
    case "password_reset_sent":
      return "비밀번호 재설정 메일을 발송했습니다. 메일함(스팸함 포함)의 링크로 새 비밀번호를 설정해 주세요.";
    case "password_reset_done":
      return "비밀번호가 변경되었습니다. 새 비밀번호로 로그인해 주세요.";
    default:
      return null;
  }
}

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = parseSafeNext(params?.next ?? null);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const profile = await getProfile(user.id);
    if (profile?.is_active && profile.role) {
      redirect(getRoleHomePath(profile.role));
    }
  }

  async function signIn(formData: FormData) {
    "use server";

    const nextSafe = parseSafeNext(String(formData.get("next") ?? ""));
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const roleRaw = String(formData.get("role") ?? "");

    const q = (extra: string) => {
      const parts = new URLSearchParams();
      parts.set("error", extra);
      if (nextSafe) {
        parts.set("next", nextSafe);
      }
      return `/login?${parts.toString()}`;
    };

    if (!email || !password) {
      redirect(q("missing"));
    }

    if (!isUserRole(roleRaw)) {
      redirect(q("role_mismatch"));
    }

    const supabaseServer = await createClient();
    const { error } = await supabaseServer.auth.signInWithPassword({ email, password });

    if (error) {
      redirect(q("invalid"));
    }

    const {
      data: { user: signedInUser },
    } = await supabaseServer.auth.getUser();

    if (!signedInUser) {
      redirect(q("invalid"));
    }

    const { data: profileRow } = await supabaseServer
      .from("profiles")
      .select("id, role, is_active")
      .eq("id", signedInUser.id)
      .maybeSingle();

    if (!profileRow) {
      await supabaseServer.auth.signOut();
      redirect(q("invalid"));
    }

    if (profileRow.role !== roleRaw) {
      await supabaseServer.auth.signOut();
      redirect(q("role_mismatch"));
    }

    if (!profileRow.is_active) {
      await supabaseServer.auth.signOut();
      redirect(q("pending"));
    }

    const destination =
      profileRow.role === "admin" && nextSafe?.startsWith("/admin")
        ? nextSafe
        : getRoleHomePath(profileRow.role ?? "");

    redirect(destination);
  }

  return (
    <LoginScreen
      nextPath={nextPath}
      initialError={errorMessage(params?.error)}
      initialMessage={successMessage(params?.message)}
      signInAction={signIn}
    />
  );
}
