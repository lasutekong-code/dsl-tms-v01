import type { SupabaseClient } from '@supabase/supabase-js';

const ALLOWED_BUCKETS = new Set(['vehicle-photos', 'driver-photos']);

export async function createStorageSignedUrl(
  supabase: SupabaseClient,
  bucket: string,
  path: string,
  expiresIn: number,
) {
  if (!ALLOWED_BUCKETS.has(bucket)) {
    throw new Error('Invalid bucket');
  }

  if (!path) {
    throw new Error('Invalid path');
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error || !data?.signedUrl) {
    throw new Error('Failed to create signed URL');
  }

  return {
    signed_url: data.signedUrl,
    expires_in: expiresIn,
  };
}

