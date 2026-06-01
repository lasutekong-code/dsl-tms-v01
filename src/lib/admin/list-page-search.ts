import type { SupabaseClient } from "@supabase/supabase-js";

import { decryptPii } from "@/lib/crypto/pii";
import type { Database } from "@/types/database";

type Supabase = SupabaseClient<Database>;

export function escapeIlikePattern(value: string) {
  return value.replace(/[\\%_]/g, (character) => `\\${character}`);
}

export function adminListPageHref(path: string, page: number, q?: string) {
  const params = new URLSearchParams({ page: String(page) });
  if (q?.trim()) {
    params.set("q", q.trim());
  }

  return `${path}?${params.toString()}`;
}

export function buildInFilter(column: string, ids: string[]) {
  if (ids.length === 0) {
    return null;
  }

  return `${column}.in.(${ids.join(",")})`;
}

export function buildIlikeFilter(column: string, q: string) {
  return `${column}.ilike.%${escapeIlikePattern(q)}%`;
}

export async function findVehicleIdsByNo(supabase: Supabase, q: string) {
  const { data } = await supabase.from("vehicles").select("id").ilike("vehicle_no", `%${escapeIlikePattern(q)}%`);
  return (data ?? []).map((row) => row.id);
}

export async function findClientIdsByName(supabase: Supabase, q: string) {
  const { data } = await supabase.from("clients").select("id").ilike("client_name", `%${escapeIlikePattern(q)}%`);
  return (data ?? []).map((row) => row.id);
}

export async function findDriverIdsByName(supabase: Supabase, q: string) {
  const { data } = await supabase.from("drivers").select("id, driver_name");
  const needle = q.trim().toLowerCase();
  if (!needle) {
    return [];
  }

  return (data ?? [])
    .filter((row) => {
      const name = (decryptPii(row.driver_name) ?? row.driver_name ?? "").toLowerCase();
      return name.includes(needle);
    })
    .map((row) => row.id);
}

export async function findOwnerIdsByName(supabase: Supabase, q: string) {
  const { data } = await supabase.from("owners").select("id, owner_name");
  const needle = q.trim().toLowerCase();
  if (!needle) {
    return [];
  }

  return (data ?? [])
    .filter((row) => {
      const name = (decryptPii(row.owner_name) ?? row.owner_name ?? "").toLowerCase();
      return name.includes(needle);
    })
    .map((row) => row.id);
}
