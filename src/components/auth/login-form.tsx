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

  return (
    <form action={formAction} className="flex w-full flex-col gap-5">
      <input type="hidden" name="redirect" value={redirectTo} />

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="email"
          className="text-sm font-medium text-slate-700"
        >
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
          className="h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="password"
          className="text-sm font-medium text-slate-700"
        >
          비밀번호
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className="h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {errorMessage ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="h-12 w-full rounded-lg bg-blue-700 text-base font-semibold text-white shadow-sm transition hover:bg-blue-800 active:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "로그인 중…" : "로그인"}
      </button>
    </form>
  );
}
