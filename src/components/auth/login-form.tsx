"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";
import {
  getProfileByUserId,
  getRedirectPathForRole,
} from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/client";

const INACTIVE_ACCOUNT_MESSAGE =
  "비활성화된 계정입니다. 관리자에게 문의하십시오.";

export function LoginForm() {
  const router = useRouter();
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
          profileError ?? "프로필 정보를 확인할 수 없습니다. 관리자에게 문의하십시오.",
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

      router.replace(getRedirectPathForRole(profile.role));
      router.refresh();
    } catch {
      setErrorMessage("로그인 중 오류가 발생했습니다. 다시 시도해 주세요.");
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5">
      <div className="space-y-2">
        <Label htmlFor="email">이메일</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="name@company.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isLoading}
          required
          className="h-11"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="password">비밀번호</Label>
          <Link
            href="#"
            className="text-xs text-muted-foreground transition-colors hover:text-primary"
            aria-disabled
            onClick={(event) => event.preventDefault()}
            tabIndex={-1}
          >
            비밀번호 재설정 (준비 중)
          </Link>
        </div>
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
          className="h-11"
        />
      </div>

      {errorMessage ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
        >
          {errorMessage}
        </div>
      ) : null}

      <Button
        type="submit"
        size="lg"
        className="h-11 w-full text-base"
        disabled={isLoading}
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
    </form>
  );
}
