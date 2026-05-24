"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "../../lib/supabaseClient";

export default function RoleProtectedPage({
  allowedRoles,
  description,
  title,
}) {
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

        if (!allowedRoles.includes(profile.role)) {
          throw new Error(`현재 role(${profile.role})은 접근할 수 없습니다.`);
        }

        sessionStorage.setItem("dsl-tms-role", profile.role);

        if (isMounted) {
          setRole(profile.role);
          setStatus("접근 권한이 확인되었습니다.");
        }
      } catch (pageError) {
        if (isMounted) {
          setStatus("");
          setError(pageError.message || "화면 정보를 불러오지 못했습니다.");
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [allowedRoles, router]);

  async function handleLogout() {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    sessionStorage.removeItem("dsl-tms-role");
    router.replace("/login");
  }

  return (
    <main className="page">
      <section className="card stack" aria-labelledby="role-page-title">
        <div>
          <h1 id="role-page-title">{title}</h1>
          <p className="muted">{description}</p>
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
