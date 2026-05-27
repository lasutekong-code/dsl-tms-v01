"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { LOGIN_ROLE_OPTIONS } from "@/lib/auth/login-roles";
import type { UserRole } from "@/types/vehicle";

type Props = {
  mode: "signup" | "find_id" | "find_password";
  title: string;
  description: string;
};

export function AccountRequestForm({ mode, title, description }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [role, setRole] = useState<UserRole>("client_manager");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      if (mode === "signup") {
        if (password.length < 8) {
          toast.error("비밀번호는 8자 이상이어야 합니다.");
          return;
        }
        if (password !== passwordConfirm) {
          toast.error("비밀번호 확인이 일치하지 않습니다.");
          return;
        }

        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name, phone, role }),
        });
        const json: unknown = await res.json().catch(() => null);
        if (!res.ok) {
          const err =
            json && typeof json === "object" && "error" in json && typeof (json as { error: unknown }).error === "string"
              ? (json as { error: string }).error
              : "가입 신청에 실패했습니다.";
          toast.error(err);
          return;
        }

        router.push("/login?message=signup_pending");
        return;
      }

      const res = await fetch("/api/auth/account-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request_type: mode,
          email,
          name,
          phone,
          role,
          message,
        }),
      });
      const json: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const err =
          json && typeof json === "object" && "error" in json && typeof (json as { error: unknown }).error === "string"
            ? (json as { error: string }).error
            : "요청 접수에 실패했습니다.";
        toast.error(err);
        return;
      }

      const payload = json && typeof json === "object" && "data" in json ? (json as { data: { hasAccount?: boolean; message?: string } }).data : null;

      if (payload && !payload.hasAccount) {
        toast.message(payload.message ?? "계정이 없습니다.", {
          description: "신규 가입 페이지로 이동합니다.",
          action: {
            label: "신규 가입",
            onClick: () => router.push("/login/signup"),
          },
        });
        router.push("/login/signup");
        return;
      }

      router.push("/login?message=request_submitted");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fafafa] px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-neutral-900">{title}</h1>
          <p className="mt-2 text-sm text-neutral-600">{description}</p>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-8 shadow-md">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">이름</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 w-full rounded-md border border-neutral-300 bg-[#fafafa] px-3 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">이메일 (아이디)</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 w-full rounded-md border border-neutral-300 bg-[#fafafa] px-3 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">연락처</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-11 w-full rounded-md border border-neutral-300 bg-[#fafafa] px-3 text-sm"
              />
            </div>

            {mode === "signup" ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">역할</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="h-11 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm"
                  >
                    {LOGIN_ROLE_OPTIONS.filter((r) => r.value !== "admin").map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">비밀번호</label>
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 w-full rounded-md border border-neutral-300 bg-[#fafafa] px-3 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">비밀번호 확인</label>
                  <input
                    required
                    type="password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    className="h-11 w-full rounded-md border border-neutral-300 bg-[#fafafa] px-3 text-sm"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">역할 (선택)</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="h-11 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm"
                  >
                    {LOGIN_ROLE_OPTIONS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">요청 내용</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    placeholder="추가로 전달할 내용"
                    className="w-full rounded-md border border-neutral-300 bg-[#fafafa] px-3 py-2 text-sm"
                  />
                </div>
                <p className="text-xs text-neutral-500">
                  등록된 계정이 없으면 신규 가입 안내로 연결됩니다. 로그인이 계속 안 되면{" "}
                  <Link href="/login/signup" className="text-[#2196f3] underline">
                    신규 가입
                  </Link>
                  을 이용해 주세요.
                </p>
              </>
            )}

            <button
              type="submit"
              disabled={pending}
              className="h-11 w-full rounded-md bg-[#2196f3] text-sm font-semibold text-white hover:bg-[#1976d2] disabled:opacity-60"
            >
              {pending ? "처리 중..." : mode === "signup" ? "가입 신청" : "요청 접수"}
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
