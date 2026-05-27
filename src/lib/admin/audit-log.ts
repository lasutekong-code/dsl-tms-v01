import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";
import type { Json } from "@/types/vehicle";

type Supabase = SupabaseClient<Database>;

export type AuditParams = {
  profileId: string;
  userId: string;
  action: string;
  targetTable?: string | null;
  targetId?: string | null;
  vehicleId?: string | null;
  metadata?: Json | null;
};

export async function insertAuditLog(supabase: Supabase, params: AuditParams) {
  const { error } = await supabase.from("audit_logs").insert({
    profile_id: params.profileId,
    user_id: params.userId,
    action: params.action,
    target_table: params.targetTable ?? null,
    target_id: params.targetId ?? null,
    vehicle_id: params.vehicleId ?? null,
    metadata: params.metadata ?? null,
  });

  if (error) {
    console.error("audit_logs insert failed", error.message);
  }
}
