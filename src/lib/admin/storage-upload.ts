import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export async function uploadAdminStorageObject(
  bucket: string,
  path: string,
  body: Buffer,
  contentType: string,
  upsert = true,
) {
  const service = createServiceRoleClient();
  const client = service ?? (await createClient());
  return client.storage.from(bucket).upload(path, body, { upsert, contentType });
}

export async function removeAdminStorageObject(bucket: string, path: string) {
  const service = createServiceRoleClient();
  const client = service ?? (await createClient());
  return client.storage.from(bucket).remove([path]);
}
