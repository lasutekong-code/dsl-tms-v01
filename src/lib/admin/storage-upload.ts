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
  if (service) {
    const result = await service.storage.from(bucket).upload(path, body, { upsert, contentType });
    if (!result.error) {
      return result;
    }
  }

  const client = await createClient();
  return client.storage.from(bucket).upload(path, body, { upsert, contentType });
}

export async function removeAdminStorageObject(bucket: string, path: string) {
  const service = createServiceRoleClient();
  if (!service) {
    const client = await createClient();
    return client.storage.from(bucket).remove([path]);
  }

  return service.storage.from(bucket).remove([path]);
}
