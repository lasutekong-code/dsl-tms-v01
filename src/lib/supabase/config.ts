const REQUIRED_SUPABASE_ENV = [
  {
    key: "NEXT_PUBLIC_SUPABASE_URL",
    value: process.env.NEXT_PUBLIC_SUPABASE_URL,
  },
  {
    key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
] as const;

export class SupabaseConfigurationError extends Error {
  readonly missingKeys: string[];

  constructor(missingKeys = getMissingSupabaseEnvKeys()) {
    super(`Missing Supabase environment variables: ${missingKeys.join(", ")}`);
    this.name = "SupabaseConfigurationError";
    this.missingKeys = missingKeys;
  }
}

export function getMissingSupabaseEnvKeys() {
  return REQUIRED_SUPABASE_ENV.filter(({ value }) => !value?.trim()).map(({ key }) => key);
}

export function isSupabaseConfigured() {
  return getMissingSupabaseEnvKeys().length === 0;
}

export function getSupabaseConfig() {
  const missingKeys = getMissingSupabaseEnvKeys();

  if (missingKeys.length > 0) {
    throw new SupabaseConfigurationError(missingKeys);
  }

  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
  };
}
