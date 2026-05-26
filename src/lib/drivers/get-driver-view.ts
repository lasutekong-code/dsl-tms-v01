import { applyDriverPiiPolicy } from "@/lib/privacy/driver-fields";
import { createDriverPhotoSignedUrl } from "@/lib/storage/signed-url";
import { createClient } from "@/lib/supabase/server";
import type { DriversSafeView, UserRole } from "@/types/database";

export async function getDriverSafeView(
  driverId: string,
  role: UserRole | null | undefined
): Promise<DriversSafeView | null> {
  const supabase = await createClient();

  const { data: driver, error } = await supabase
    .from("drivers")
    .select("*")
    .eq("id", driverId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !driver) return null;

  const photoSignedUrl = await createDriverPhotoSignedUrl(
    supabase,
    driver.photo_path
  );

  return applyDriverPiiPolicy(driver, role, photoSignedUrl);
}
