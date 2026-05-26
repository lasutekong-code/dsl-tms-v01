import { redirect } from "next/navigation";

import { LoginForm } from "@/components/forms/login-form";
import { Card } from "@/components/ui/card";
import { getProfile, getRoleHomePath } from "@/lib/auth/get-profile";
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

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = parseSafeNext(params?.next ?? null);
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    const profile = await getProfile(user.id);

    if (profile?.role) {
      redirect(getRoleHomePath(profile.role));
    }
  }

  async function signIn(formData: FormData) {
    "use server";

    const nextSafe = parseSafeNext(String(formData.get("next") ?? ""));
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      redirect(nextSafe ? `/login?error=missing&next=${encodeURIComponent(nextSafe)}` : "/login?error=missing");
    }

    const supabaseServer = await createClient();
    const { error } = await supabaseServer.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      redirect(nextSafe ? `/login?error=invalid&next=${encodeURIComponent(nextSafe)}` : "/login?error=invalid");
    }

    const {
      data: { user: signedInUser }
    } = await supabaseServer.auth.getUser();
    const profile = await getProfile(signedInUser?.id);

    const role = profile?.role ?? "";
    const destination =
      role === "admin" && nextSafe?.startsWith("/admin") ? nextSafe : profile?.role ? getRoleHomePath(profile.role) : "/dashboard";

    redirect(destination);
  }

  const message =
    params?.error === "missing"
      ? "이메일과 비밀번호를 입력해 주세요."
      : params?.error === "invalid"
        ? "로그인 정보가 올바르지 않습니다."
        : null;

  return (
    <main
      className="container"
      style={{ alignItems: "center", display: "grid", minHeight: "100vh", padding: "32px 0" }}
    >
      <Card style={{ margin: "0 auto", maxWidth: 440, width: "100%" }}>
        <div className="stack" style={{ marginBottom: 24 }}>
          <div>
            <p style={{ color: "var(--primary)", fontWeight: 800, margin: 0 }}>DSL TMS</p>
            <h1 style={{ fontSize: 30, margin: "8px 0" }}>로그인</h1>
            <p style={{ color: "var(--muted)", margin: 0 }}>
              Supabase Auth 계정으로 차량관리 시스템에 접속합니다.
            </p>
          </div>
          {message ? (
            <div style={{ background: "#fee4e2", borderRadius: 10, color: "var(--danger)", padding: 12 }}>
              {message}
            </div>
          ) : null}
        </div>
        <LoginForm action={signIn} defaultNext={nextPath} />
      </Card>
    </main>
  );
}
