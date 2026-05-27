type SignedUrlPayload = {
  bucket: string;
  path: string;
  vehicleId: string;
};

export async function fetchSignedPhotoUrl(payload: SignedUrlPayload) {
  const response = await fetch("/api/photos/signed-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bucket: payload.bucket,
      path: payload.path,
      vehicleId: payload.vehicleId,
    }),
  });

  if (!response.ok) {
    return null;
  }

  const body = (await response.json()) as { signedUrl?: string };
  return body.signedUrl ?? null;
}

export const VEHICLE_PHOTO_BUCKET = "vehicle-photos";
export const DRIVER_PHOTO_BUCKET = "driver-photos";
