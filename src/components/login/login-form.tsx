"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn, type LoginState } from "@/app/login/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: LoginState = {};

type LoginFormProps = {
  serverError?: string;
};

export function LoginForm({ serverError }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(signIn, initialState);
  const errorMessage = state.error ?? serverError;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="space-y-2">
        <Label htmlFor="email">이메일</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="name@company.com"
          required
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">비밀번호</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="비밀번호"
          required
          disabled={isPending}
        />
      </div>

      <p className="text-right text-sm">
        <Link
          href="#"
          className="text-[#2196f3] hover:underline"
          onClick={(e) => e.preventDefault()}
          aria-disabled
          tabIndex={-1}
        >
          비밀번호 재설정 (준비 중)
        </Link>
      </p>

      {errorMessage ? (
        <Alert variant="destructive">{errorMessage}</Alert>
      ) : null}

      <Button type="submit" className="w-full" size="lg" disabled={isPending}>
        {isPending ? "로그인 중..." : "로그인"}
      </Button>
    </form>
  );
}
