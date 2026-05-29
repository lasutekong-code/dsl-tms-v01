import type { SupabaseClient } from "@supabase/supabase-js";

import { createServiceRoleClient } from "@/lib/supabase/service-role";
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

const LEGACY_ACTIONS = new Set(["view", "export", "update", "delete"]);

function normalizeAuditAction(action: string) {
  if (LEGACY_ACTIONS.has(action)) {
    return action;
  }

  if (action.includes("delete")) {
    return "delete";
  }

  if (action.includes("view")) {
    return "view";
  }

  if (action.includes("export")) {
    return "export";
  }

  return "update";
}

export async function insertAuditLog(supabase: Supabase, params: AuditParams) {
  const detailAction = params.action;
  const metadata =
    params.metadata && typeof params.metadata === "object" && !Array.isArray(params.metadata)
      ? { ...(params.metadata as Record<string, unknown>), detail_action: detailAction }
      : { detail_action: detailAction };

  const row = {
    profile_id: params.profileId,
    user_id: params.userId,
    action: normalizeAuditAction(detailAction),
    target_table: params.targetTable ?? null,
    target_id: params.targetId ?? null,
    vehicle_id: params.vehicleId ?? null,
    metadata,
  };

  const service = createServiceRoleClient();
  const client = service ?? supabase;
  const { error } = await client.from("audit_logs").insert(row);

  if (error) {
    console.error("audit_logs insert failed", error.message);
  }
}
