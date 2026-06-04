import { Suspense } from "react";

import { AppShell } from "@/components/layout/app-shell";
import SearchPageClient from "@/app/search/search-page-client";
import { requireProfile } from "@/lib/auth/get-profile";

export default async function SearchPage() {
  const profile = await requireProfile();

  return (
    <AppShell profile={profile}>
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Suspense fallback={<p className="text-sm text-slate-500">검색 화면을 불러오는 중…</p>}>
          <SearchPageClient />
        </Suspense>
      </div>
    </AppShell>
  );
}
