import { AppShell } from "@/components/layout/app-shell";
import SearchPageClient from "@/app/search/search-page-client";
import { requireProfile } from "@/lib/auth/get-profile";

export const dynamic = "force-dynamic";

export default async function SearchPage() {
  const profile = await requireProfile();

  return (
    <AppShell profile={profile}>
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <SearchPageClient />
      </div>
    </AppShell>
  );
}
