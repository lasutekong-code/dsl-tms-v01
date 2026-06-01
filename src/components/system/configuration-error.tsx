import type { ReactNode } from "react";

import { getMissingSupabaseEnvKeys } from "@/lib/supabase/config";

type ConfigurationErrorPageProps = {
  actions?: ReactNode;
  description?: string;
  title?: string;
};

export function ConfigurationErrorPage({
  actions,
  description = "Vercel 프로젝트의 Environment Variables에 Supabase 공개 URL과 anon key를 설정한 뒤 다시 배포해 주세요.",
  title = "Supabase 환경변수가 설정되지 않았습니다",
}: ConfigurationErrorPageProps) {
  const missingKeys = getMissingSupabaseEnvKeys();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-2xl rounded-2xl border border-amber-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-bold uppercase tracking-wide text-amber-600">Configuration required</p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">{description}</p>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">필수 환경변수</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {(missingKeys.length > 0
              ? missingKeys
              : ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]
            ).map((key) => (
              <li key={key}>
                <code className="rounded bg-white px-2 py-1 font-mono text-xs text-slate-900">{key}</code>
              </li>
            ))}
          </ul>
        </div>

        <ol className="mt-6 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-600">
          <li>Vercel 대시보드에서 dsl-tms-v01 프로젝트를 엽니다.</li>
          <li>Settings → Environment Variables에 위 키를 Production 환경으로 추가합니다.</li>
          <li>값을 저장한 뒤 최신 커밋으로 다시 배포합니다.</li>
        </ol>

        {actions ? <div className="mt-6 flex flex-wrap gap-3">{actions}</div> : null}
      </section>
    </main>
  );
}
