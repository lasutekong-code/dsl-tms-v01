"use client";

import Link from "next/link";
import { useState } from "react";
import { Truck } from "lucide-react";

import { LOGIN_ROLE_OPTIONS } from "@/lib/auth/login-roles";
import type { UserRole } from "@/types/vehicle";
import { cn } from "@/lib/utils/cn";

type LoginScreenProps = {
  nextPath?: string | null;
  initialError?: string | null;
  initialMessage?: string | null;
  signInAction: (formData: FormData) => Promise<void>;
};

export function LoginScreen({ nextPath, initialError, initialMessage, signInAction }: LoginScreenProps) {
  const [role, setRole] = useState<UserRole>("admin");

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fafafa] px-4 py-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-lg bg-[#2196f3]">
            <Truck className="size-8 text-white" aria-hidden />
          </div>
          <h1 className="mt-5 text-[30px] font-semibold leading-9 text-neutral-900">차량관리 시스템</h1>
          <p className="mt-1 text-base text-neutral-600">Fleet Management System</p>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white px-8 pb-6 pt-8 shadow-md">
          {initialMessage ? (
            <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {initialMessage}
            </div>
          ) : null}
          {initialError ? (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {initialError}
              <p className="mt-2 text-xs text-red-600">
                계정이 없거나 승인 전이라면{" "}
                <Link href="/login/signup" className="font-medium underline">
                  신규 가입
                </Link>
                을 신청해 주세요.
              </p>
            </div>
          ) : null}

          <form action={signInAction} className="space-y-6">
            <input type="hidden" name="role" value={role} />
            {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}

            <div className="space-y-3">
              <p className="text-sm font-medium text-neutral-900">역할 선택</p>
              <div className="grid grid-cols-2 gap-3">
                {LOGIN_ROLE_OPTIONS.map((opt) => {
                  const selected = role === opt.value;
                  const Icon = opt.Icon;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setRole(opt.value)}
                      className={cn(
                        "flex h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition-colors",
                        selected ? opt.activeClass : opt.inactiveClass,
                      )}
                    >
                      <Icon className="size-5 shrink-0" aria-hidden />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-neutral-900">
                아이디
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                required
                placeholder="아이디를 입력하세요"
                className="h-12 w-full rounded-md border border-neutral-300 bg-[#fafafa] px-4 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-[#2196f3] focus:outline-none focus:ring-2 focus:ring-[#2196f3]/20"
              />
              <p className="text-xs text-neutral-500">로그인 아이디는 등록한 이메일 주소입니다.</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-neutral-900">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="비밀번호를 입력하세요"
                className="h-12 w-full rounded-md border border-neutral-300 bg-[#fafafa] px-4 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-[#2196f3] focus:outline-none focus:ring-2 focus:ring-[#2196f3]/20"
              />
            </div>

            <button
              type="submit"
              className="h-12 w-full rounded-md bg-[#2196f3] text-base font-semibold text-white transition-colors hover:bg-[#1976d2] disabled:opacity-60"
            >
              로그인
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-neutral-600">
            아이디·비밀번호가 없으신가요?{" "}
            <Link href="/login/signup" className="font-medium text-[#2196f3] hover:underline">
              신규 가입
            </Link>
          </p>

          <div className="mt-6 flex items-center justify-center gap-4 text-base">
            <Link href="/login/find-id" className="font-medium text-neutral-600 hover:text-[#2196f3]">
              아이디 찾기
            </Link>
            <span className="text-neutral-300" aria-hidden>
              |
            </span>
            <Link href="/login/find-password" className="font-medium text-neutral-600 hover:text-[#2196f3]">
              비밀번호 찾기
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-neutral-500">© 2026 Fleet Management System. All rights reserved.</p>
      </div>
    </main>
  );
}
