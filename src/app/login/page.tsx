import { redirect } from "next/navigation";
import { Truck } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";
import {
  getProfileByUserId,
  getRedirectPathForRole,
} from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { profile } = await getProfileByUserId(supabase, user.id);
    if (profile?.is_active) {
      redirect(getRedirectPathForRole(profile.role));
    }
  }

  return (
    <main className="flex min-h-full flex-1 flex-col lg:flex-row">
      <section
        aria-label="서비스 소개"
        className="relative flex flex-col justify-center bg-[#1e3a8a] px-6 py-10 text-white sm:px-10 lg:w-[42%] lg:min-h-screen lg:px-14 lg:py-16 xl:w-[38%]"
      >
        <div className="mx-auto w-full max-w-md lg:mx-0">
          <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
            <Truck className="size-8" strokeWidth={1.5} aria-hidden />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            차량관리 시스템
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-blue-100 sm:text-base">
            운송 차량 통합 관리를 위한 사내 업무 플랫폼입니다. 허가된 계정으로
            안전하게 접속하세요.
          </p>
        </div>
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          aria-hidden
        >
          <div className="absolute -right-20 top-1/4 size-64 rounded-full bg-blue-400/40 blur-3xl" />
          <div className="absolute bottom-0 left-0 size-48 rounded-full bg-indigo-300/30 blur-3xl" />
        </div>
      </section>

      <section className="flex flex-1 items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-10 sm:px-6 lg:py-16">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-lg ring-1 ring-black/5">
            <CardHeader className="border-b pb-6">
              <CardTitle className="text-xl font-semibold">로그인</CardTitle>
              <CardDescription>
                차량관리 시스템에 접속하려면 계정 정보를 입력하세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <LoginForm />
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-xs text-muted-foreground sm:text-sm">
            허가된 사용자만 접근할 수 있습니다.
          </p>
        </div>
      </section>
    </main>
  );
}
