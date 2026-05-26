"use client";

import { useActionState } from "react";
import { signIn, type LoginState } from "@/app/login/actions";

const initialState: LoginState = {};

type LoginFormProps = {
  redirectTo?: string;
  serverError?: string;
};

export function LoginForm({ redirectTo = "/", serverError }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(signIn, initialState);
  const errorMessage = state.error ?? serverError;

  const inputClass =
    "h-10 w-full rounded-lg border border-[#e5e5e5] bg-white px-3 text-base text-[#171717] outline-none transition placeholder:text-[#737373] focus:border-[#2196f3] focus:ring-2 focus:ring-[#e3f2fd]";

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      <input type="hidden" name="redirect" value={redirectTo} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-[#525252]">
          업무 이메일
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          autoFocus
          required
          placeholder="name@company.com"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-[#525252]">
          비밀번호
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="비밀번호"
          className={inputClass}
        />
      </div>

      {errorMessage ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-[#c62828]"
        >
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="mt-1 h-10 w-full rounded-lg bg-[#2196f3] text-sm font-semibold text-white transition hover:bg-[#1e88e5] active:bg-[#1976d2] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "로그인 중…" : "로그인"}
      </button>
    </form>
  );
}
