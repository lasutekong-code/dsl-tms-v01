"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "../../lib/supabaseClient";

export default function DashboardPage() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("세션을 확인 중입니다...");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const supabase = getSupabaseClient();
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!session?.user?.id) {
          router.replace("/login");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (profileError) {
          throw profileError;
        }

        if (!profile?.role) {
          throw new Error("프로필 role 값이 없습니다.");
        }

        sessionStorage.setItem("dsl-tms-role", profile.role);

        if (isMounted) {
          setRole(profile.role);
          setStatus("대시보드 접근 권한이 확인되었습니다.");
        }
      } catch (dashboardError) {
        if (isMounted) {
          setStatus("");
          setError(
            dashboardError.message || "대시보드 정보를 불러오지 못했습니다.",
          );
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [router]);

  async function handleLogout() {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    sessionStorage.removeItem("dsl-tms-role");
    router.replace("/login");
  }

  return (
    <main className="page">
      <section className="card stack" aria-labelledby="dashboard-title">
        <div>
          <h1 id="dashboard-title">대시보드</h1>
          <p className="muted">profiles.role 확인 후 접근하는 화면입니다.</p>
        </div>

        {status ? <p role="status">{status}</p> : null}
        {role ? <p>현재 role: <strong>{role}</strong></p> : null}
        {error ? <p className="error" role="alert">{error}</p> : null}

        <button className="button" type="button" onClick={handleLogout}>
          로그아웃
        </button>
      </section>
    </main>
  );
}
