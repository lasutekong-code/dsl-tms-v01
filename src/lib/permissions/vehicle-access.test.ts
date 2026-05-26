import assert from "node:assert/strict";
import test from "node:test";

import { canAccessVehicle, parseUserRole } from "@/lib/permissions/vehicle-access";
import type { Database } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

function createMockSupabase(handlers: {
  vehicleClientId?: string | null;
  clientAccess?: boolean;
  vehicleAccess?: boolean;
}) {
  return {
    from(table: string) {
      const builder = {
        select() {
          return builder;
        },
        eq(column: string, value: string) {
          if (table === "vehicle_card_view" && column === "vehicle_id") {
            builder._vehicleId = value;
          }
          if (table === "user_client_access") {
            builder._clientAccess = handlers.clientAccess ?? false;
          }
          if (table === "user_vehicle_access") {
            builder._vehicleAccess = handlers.vehicleAccess ?? false;
          }
          return builder;
        },
        maybeSingle: async () => {
          if (table === "vehicle_card_view") {
            return {
              data: handlers.vehicleClientId
                ? { client_id: handlers.vehicleClientId }
                : null,
              error: null,
            };
          }
          if (table === "user_client_access") {
            return { data: builder._clientAccess ? { client_id: "client-1" } : null, error: null };
          }
          if (table === "user_vehicle_access") {
            return { data: builder._vehicleAccess ? { vehicle_id: builder._vehicleId } : null, error: null };
          }
          return { data: null, error: null };
        },
        _vehicleId: "",
        _clientAccess: false,
        _vehicleAccess: false,
      };

      return builder;
    },
  } as unknown as SupabaseClient<Database>;
}

test("parseUserRole accepts allowed roles", () => {
  assert.equal(parseUserRole("admin"), "admin");
  assert.equal(parseUserRole("client_manager"), "client_manager");
  assert.equal(parseUserRole("owner"), "owner");
  assert.equal(parseUserRole("driver"), "driver");
  assert.equal(parseUserRole("staff"), "staff");
  assert.equal(parseUserRole("invalid"), null);
});

test("admin can access any vehicle", async () => {
  const supabase = createMockSupabase({});
  const allowed = await canAccessVehicle(
    supabase,
    { id: "u1", role: "admin", is_active: true, full_name: null, email: null },
    "v1",
  );
  assert.equal(allowed, true);
});

test("client_manager requires matching client access", async () => {
  const supabase = createMockSupabase({ vehicleClientId: "client-1", clientAccess: true });
  const allowed = await canAccessVehicle(
    supabase,
    { id: "u1", role: "client_manager", is_active: true, full_name: null, email: null },
    "v1",
    "client-1",
  );
  assert.equal(allowed, true);
});

test("driver requires vehicle access row", async () => {
  const supabase = createMockSupabase({ vehicleAccess: true });
  const allowed = await canAccessVehicle(
    supabase,
    { id: "u1", role: "driver", is_active: true, full_name: null, email: null },
    "v1",
  );
  assert.equal(allowed, true);
});

test("owner without vehicle access is denied", async () => {
  const supabase = createMockSupabase({ vehicleAccess: false });
  const allowed = await canAccessVehicle(
    supabase,
    { id: "u1", role: "owner", is_active: true, full_name: null, email: null },
    "v1",
  );
  assert.equal(allowed, false);
});
