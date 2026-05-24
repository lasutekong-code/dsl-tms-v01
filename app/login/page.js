"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getSupabaseClient } from "../../lib/supabaseClient";

const ROLE_DESTINATIONS = {
  admin: "/admin/vehicles",
  client_manager: "/search",
  owner: "/search",
  driver: "/search",
  staff: "/search",
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setStatus("로그인 중입니다...");
    setIsSubmitting(true);

    try {
      const supabase = getSupabaseClient();
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) {
        throw authError;
      }

      const userId = authData.user?.id;

      if (!userId) {
        throw new Error("로그인 사용자 정보를 확인할 수 없습니다.");
      }

      setStatus("로그인 성공. 프로필 정보를 확인 중입니다...");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (profileError) {
        throw profileError;
      }

      if (!profile?.role) {
        throw new Error("프로필 role 값이 없습니다.");
      }

      const destination = ROLE_DESTINATIONS[profile.role];

      if (!destination) {
        throw new Error(`지원하지 않는 role 값입니다: ${profile.role}`);
      }

      sessionStorage.setItem("dsl-tms-role", profile.role);
      router.replace(destination);
      router.refresh();
    } catch (loginError) {
      setStatus("");
      setError(loginError.message || "로그인 처리 중 오류가 발생했습니다.");
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page">
      <section className="card stack" aria-labelledby="login-title">
        <div>
          <h1 id="login-title">로그인</h1>
          <p className="muted">
            로그인 성공 후 profiles 테이블에서 role을 확인하고 역할별 화면으로
            이동합니다.
          </p>
        </div>

        <form className="stack" onSubmit={handleSubmit}>
          <label className="field">
            이메일
            <input
              className="input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="field">
            비밀번호
            <input
              className="input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          <button className="button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "확인 중..." : "로그인"}
          </button>
        </form>

        {status ? <p className="muted" role="status">{status}</p> : null}
        {error ? <p className="error" role="alert">{error}</p> : null}
      </section>
    </main>
  );
}
