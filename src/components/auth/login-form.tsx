"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Loader2,
  Truck,
  User,
  UserCircle,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";
import {
  getProfileByUserId,
  getRedirectPathForRole,
  type UserRole,
} from "@/lib/auth/get-profile";
import { LOGIN_ROLE_OPTIONS, ROLE_LABELS } from "@/lib/auth/role-labels";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const INACTIVE_ACCOUNT_MESSAGE =
  "비활성화된 계정입니다. 관리자에게 문의하십시오.";

const ROLE_MISMATCH_MESSAGE =
  "선택한 역할과 계정 역할이 일치하지 않습니다. 역할을 확인한 뒤 다시 시도해 주세요.";

const ROLE_ICONS: Record<UserRole, typeof User> = {
  admin: User,
  client_manager: Building2,
  owner: Users,
  driver: UserCircle,
  staff: Users,
};

export function LoginForm() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setErrorMessage("이메일과 비밀번호를 입력해 주세요.");
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });

      if (authError) {
        setErrorMessage(getAuthErrorMessage(authError.message));
        setIsLoading(false);
        return;
      }

      const userId = authData.user?.id;
      if (!userId) {
        setErrorMessage("로그인에 실패했습니다. 다시 시도해 주세요.");
        setIsLoading(false);
        return;
      }

      const { profile, error: profileError } = await getProfileByUserId(
        supabase,
        userId,
      );

      if (profileError || !profile) {
        await supabase.auth.signOut();
        setErrorMessage(
          profileError ??
            "프로필 정보를 확인할 수 없습니다. 관리자에게 문의하십시오.",
        );
        setIsLoading(false);
        return;
      }

      if (!profile.is_active) {
        await supabase.auth.signOut();
        setErrorMessage(INACTIVE_ACCOUNT_MESSAGE);
        setIsLoading(false);
        return;
      }

      if (profile.role !== selectedRole) {
        await supabase.auth.signOut();
        setErrorMessage(ROLE_MISMATCH_MESSAGE);
        setIsLoading(false);
        return;
      }

      router.replace(getRedirectPathForRole(profile.role));
      router.refresh();
    } catch {
      setErrorMessage("로그인 중 오류가 발생했습니다. 다시 시도해 주세요.");
      setIsLoading(false);
    }
  }

  return (
    <div className="flex w-full flex-col items-center">
      <div className="w-full max-w-[420px] rounded-2xl bg-white px-6 py-8 shadow-xl ring-1 ring-black/5 sm:px-8 sm:py-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-sm">
            <Truck className="size-7" strokeWidth={1.75} aria-hidden />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            차량관리 시스템
          </h1>
          <p className="mt-1 text-sm text-slate-500">Fleet Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">
              역할 선택
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {LOGIN_ROLE_OPTIONS.map((role) => {
                const Icon = ROLE_ICONS[role];
                const isSelected = selectedRole === role;
                const isStaff = role === "staff";

                return (
                  <button
                    key={role}
                    type="button"
                    disabled={isLoading}
                    onClick={() => setSelectedRole(role)}
                    className={cn(
                      "flex items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-xs font-medium transition-colors sm:text-sm",
                      isStaff && "col-span-2",
                      isSelected
                        ? "bg-violet-700 text-white shadow-sm"
                        : "bg-slate-200 text-slate-700 hover:bg-slate-300",
                    )}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden />
                    <span>{ROLE_LABELS[role]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-slate-700">
              이메일
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="이메일을 입력하세요"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isLoading}
              required
              className="h-11 border-slate-200 bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-slate-700"
            >
              비밀번호
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isLoading}
              required
              className="h-11 border-slate-200 bg-white"
            />
          </div>

          {errorMessage ? (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
            >
              {errorMessage}
            </div>
          ) : null}

          <Button
            type="submit"
            disabled={isLoading}
            className="h-11 w-full rounded-lg bg-sky-500 text-base font-semibold text-white hover:bg-sky-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" aria-hidden />
                로그인 중...
              </>
            ) : (
              "로그인"
            )}
          </Button>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 sm:text-sm">
            <Link
              href="#"
              className="hover:text-sky-600"
              onClick={(event) => event.preventDefault()}
              tabIndex={-1}
              aria-disabled
            >
              아이디 찾기
            </Link>
            <span aria-hidden className="text-slate-300">
              |
            </span>
            <Link
              href="#"
              className="hover:text-sky-600"
              onClick={(event) => event.preventDefault()}
              tabIndex={-1}
              aria-disabled
            >
              비밀번호 찾기 (준비 중)
            </Link>
          </div>
        </form>
      </div>

      <p className="mt-6 text-center text-xs text-slate-500 sm:text-sm">
        허가된 사용자만 접근할 수 있습니다.
      </p>
      <p className="mt-3 text-center text-[11px] text-slate-400 sm:text-xs">
        © 2026 Fleet Management System. All rights reserved.
      </p>
    </div>
  );
}
