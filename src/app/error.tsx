"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isConfigError = error.message.includes("Supabase environment variables");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="text-xl font-bold text-slate-900">페이지를 불러오지 못했습니다</h1>
      <p className="text-sm leading-6 text-slate-600">
        {isConfigError
          ? "Supabase 환경 변수가 설정되지 않았습니다. Vercel Preview·Production에 NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY를 등록하고 배포를 다시 실행해 주세요."
          : "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button type="button" variant="outline" onClick={() => reset()}>
          다시 시도
        </Button>
        <Button asChild variant="default">
          <Link href="/login">로그인 화면</Link>
        </Button>
      </div>
    </main>
  );
}
