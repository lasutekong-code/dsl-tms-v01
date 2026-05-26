import { SearchShell } from "@/components/layout/search-shell";
import { VehicleSearchPage } from "@/components/vehicle/vehicle-search-page";
import { requireProfile } from "@/lib/auth/get-profile";

export default async function SearchPage() {
  const profile = await requireProfile();

  return (
    <SearchShell profile={profile}>
      <VehicleSearchPage />
    </SearchShell>
  );
}
