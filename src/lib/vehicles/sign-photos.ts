import type { SupabaseClient } from "@supabase/supabase-js";

import {
  DRIVER_PHOTO_BUCKET,
  VEHICLE_PHOTO_BUCKET,
} from "@/lib/vehicles/photo-url";
import type { Database } from "@/types/database";
import type { VehicleDetail } from "@/types/vehicle";

const SIGNED_URL_TTL_SECONDS = 600;

type PhotoRow = {
  storage_path: string;
  bucket?: string | null;
};

async function createSignedUrl(
  supabase: SupabaseClient<Database>,
  bucket: string,
  path: string,
) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

  if (error) {
    console.error("Failed to create signed URL", { bucket, path, error: error.message });
    return null;
  }

  return data.signedUrl;
}

export async function attachSignedPhotoUrls(
  supabase: SupabaseClient<Database>,
  detail: VehicleDetail,
): Promise<VehicleDetail> {
  const vehicle_photos = await Promise.all(
    detail.vehicle_photos.map(async (photo) => {
      if (!photo.storage_path) {
        return { ...photo, signed_url: null };
      }

      const bucket =
        (photo as VehicleDetail["vehicle_photos"][number] & { bucket?: string | null }).bucket?.trim() ||
        VEHICLE_PHOTO_BUCKET;
      const signed_url = await createSignedUrl(supabase, bucket, photo.storage_path);

      return {
        ...photo,
        signed_url,
      };
    }),
  );

  let driver_photo = detail.driver_photo;

  if (driver_photo?.storage_path) {
    const bucket =
      (driver_photo as NonNullable<VehicleDetail["driver_photo"]> & { bucket?: string | null }).bucket?.trim() ||
      DRIVER_PHOTO_BUCKET;
    const signed_url = await createSignedUrl(supabase, bucket, driver_photo.storage_path);

    driver_photo = {
      ...driver_photo,
      signed_url,
    };
  }

  return {
    ...detail,
    vehicle_photos,
    driver_photo,
  };
}

export async function signPhotoRow(
  supabase: SupabaseClient<Database>,
  photo: PhotoRow,
  defaultBucket: string,
) {
  const bucket = photo.bucket?.trim() || defaultBucket;
  return createSignedUrl(supabase, bucket, photo.storage_path);
}
