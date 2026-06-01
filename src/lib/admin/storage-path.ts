/** Supabase Storage object keys must be ASCII-safe (no Korean/spaces in path segments). */
export function buildAsciiStoragePath(prefix: string, extension: string) {
  const ext = extension.replace(/[^\w]/g, "").toLowerCase() || "bin";
  return `${prefix}/${Date.now()}.${ext}`;
}
