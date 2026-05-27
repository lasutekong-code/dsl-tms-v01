"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [email, setEmail] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json: unknown = await res.json().catch(() => null);

      if (!res.ok) {
        const err =
          json && typeof json === "object" && "error" in json && typeof (json as { error: unknown }).error === "string"
            ? (json as { error: string }).error
            : "비밀번호 재설정 요청에 실패했습니다.";
        toast.error(err);
        return;
      }

      const payload =
        json && typeof json === "object" && "data" in json
          ? (json as { data: { hasAccount?: boolean; message?: string } }).data
          : null;

      if (payload && payload.hasAccount === false) {
        toast.message(payload.message ?? "등록된 계정이 없습니다.", {
          description: "신규 가입 페이지로 이동합니다.",
          action: {
            label: "신규 가입",
            onClick: () => router.push("/login/signup"),
          },
        });
        router.push("/login/signup");
        return;
      }

      toast.success(payload?.message ?? "비밀번호 재설정 메일을 발송했습니다.");
      router.push("/login?message=password_reset_sent");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fafafa] px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-neutral-900">비밀번호 찾기</h1>
          <p className="mt-2 text-sm text-neutral-600">
            가입 시 사용한 이메일(아이디)을 입력하면 비밀번호 재설정 링크를 보내 드립니다.
          </p>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-8 shadow-md">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">이메일 (아이디)</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@company.com"
                className="h-11 w-full rounded-md border border-neutral-300 bg-[#fafafa] px-3 text-sm"
              />
            </div>

            <p className="text-xs text-neutral-500">
              메일이 오지 않으면 스팸함을 확인해 주세요. 계정이 없다면{" "}
              <Link href="/login/signup" className="text-[#2196f3] underline">
                신규 가입
              </Link>
              을 이용해 주세요.
            </p>

            <button
              type="submit"
              disabled={pending}
              className="h-11 w-full rounded-md bg-[#2196f3] text-sm font-semibold text-white hover:bg-[#1976d2] disabled:opacity-60"
            >
              {pending ? "발송 중..." : "재설정 메일 보내기"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-neutral-600">
            <Link href="/login" className="text-[#2196f3] hover:underline">
              로그인으로 돌아가기
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
