export async function fetchAdminSignedPhotoUrl(bucket: string, path: string) {
  const response = await fetch("/api/admin/photos/signed-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bucket, path }),
  });

  if (!response.ok) {
    return null;
  }

  const body = (await response.json()) as { signedUrl?: string };
  return body.signedUrl ?? null;
}
