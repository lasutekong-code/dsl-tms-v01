import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const DRIVER_PHOTOS_BUCKET =
  process.env.NEXT_PUBLIC_DRIVER_PHOTOS_BUCKET ?? "driver-photos";

const DEFAULT_EXPIRY_SECONDS = 60 * 60;

export async function createDriverPhotoSignedUrl(
  supabase: SupabaseClient<Database>,
  photoPath: string | null | undefined,
  expiresInSeconds = DEFAULT_EXPIRY_SECONDS
): Promise<string | null> {
  if (!photoPath) return null;

  const { data, error } = await supabase.storage
    .from(DRIVER_PHOTOS_BUCKET)
    .createSignedUrl(photoPath, expiresInSeconds);

  if (error || !data?.signedUrl) {
    console.error("[signed-url] driver photo:", error?.message);
    return null;
  }

  return data.signedUrl;
}
