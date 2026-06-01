"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ConfigurationErrorPage } from "@/components/system/configuration-error";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const router = useRouter();
  const supabaseConfigured = isSupabaseConfigured();
  const [pending, setPending] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  useEffect(() => {
    if (!supabaseConfigured) {
      setCheckingSession(false);
      return;
    }

    let cancelled = false;

    async function checkSession() {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!cancelled) {
          setHasSession(Boolean(session));
        }
      } catch {
        if (!cancelled) {
          setHasSession(false);
        }
      } finally {
        if (!cancelled) {
          setCheckingSession(false);
        }
      }
    }

    void checkSession();
    return () => {
      cancelled = true;
    };
  }, [supabaseConfigured]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < 8) {
      toast.error("비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    if (password !== passwordConfirm) {
      toast.error("비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    setPending(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        toast.error("비밀번호 변경에 실패했습니다. 링크가 만료되었을 수 있습니다. 비밀번호 찾기를 다시 시도해 주세요.");
        return;
      }

      await supabase.auth.signOut();
      toast.success("비밀번호가 변경되었습니다. 새 비밀번호로 로그인해 주세요.");
      router.push("/login?message=password_reset_done");
    } catch {
      toast.error("Supabase 환경변수가 설정되지 않아 비밀번호를 변경할 수 없습니다.");
    } finally {
      setPending(false);
    }
  }

  if (!supabaseConfigured) {
    return <ConfigurationErrorPage />;
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fafafa] px-4 py-8">
        <p className="text-sm text-neutral-600">세션 확인 중...</p>
      </main>
    );
  }

  if (!hasSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fafafa] px-4 py-8">
        <div className="w-full max-w-md space-y-4 rounded-lg border border-neutral-200 bg-white p-8 text-center shadow-md">
          <h1 className="text-xl font-semibold text-neutral-900">링크가 유효하지 않습니다</h1>
          <p className="text-sm text-neutral-600">
            비밀번호 재설정 메일의 링크를 다시 열어 주세요. 링크가 만료되었다면 비밀번호 찾기를 다시 요청해 주세요.
          </p>
          <Link
            href="/login/find-password"
            className="inline-block text-sm font-medium text-[#2196f3] hover:underline"
          >
            비밀번호 찾기
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fafafa] px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-neutral-900">새 비밀번호 설정</h1>
          <p className="mt-2 text-sm text-neutral-600">새 비밀번호를 입력한 뒤 저장해 주세요.</p>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-8 shadow-md">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">새 비밀번호</label>
              <input
                required
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 w-full rounded-md border border-neutral-300 bg-[#fafafa] px-3 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">새 비밀번호 확인</label>
              <input
                required
                type="password"
                autoComplete="new-password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="h-11 w-full rounded-md border border-neutral-300 bg-[#fafafa] px-3 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="h-11 w-full rounded-md bg-[#2196f3] text-sm font-semibold text-white hover:bg-[#1976d2] disabled:opacity-60"
            >
              {pending ? "저장 중..." : "비밀번호 저장"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
