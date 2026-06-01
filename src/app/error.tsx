"use client";

import { useEffect } from "react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
        <p className="text-sm font-bold uppercase tracking-wide text-red-600">Application error</p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">화면을 불러오지 못했습니다</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          일시적인 오류가 발생했거나 배포 환경 설정이 누락되었습니다. Vercel 환경변수를 확인한 뒤 다시 시도해
          주세요.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          다시 시도
        </button>
      </section>
    </main>
  );
}
