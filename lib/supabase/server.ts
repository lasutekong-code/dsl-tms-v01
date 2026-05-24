import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

import type { Database } from "@/types/database";

export async function createSupabaseServerClient(request?: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and anon key environment variables are required.");
  }

  const cookieStore = await cookies();
  const authorization = request?.headers.get("authorization");

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    ...(authorization
      ? {
          global: {
            headers: {
              Authorization: authorization,
            },
          },
        }
      : {}),
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot set cookies; Route Handlers can. The client
          // still works for read-only auth checks when cookie mutation is denied.
        }
      },
    },
  });
}
