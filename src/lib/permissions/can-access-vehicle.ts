import type { SupabaseClient } from '@supabase/supabase-js';

type Role = 'admin' | 'client_manager' | 'owner' | 'driver' | 'staff';

export interface VehicleAccessResult {
  allowed: boolean;
  role: Role | null;
  can_view_sensitive: boolean;
}

export async function canAccessVehicle(
  supabase: SupabaseClient,
  userId: string,
  vehicleId: string,
): Promise<VehicleAccessResult> {
  const baseResult: VehicleAccessResult = {
    allowed: false,
    role: null,
    can_view_sensitive: false,
  };

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role, is_active, can_view_sensitive')
    .eq('id', userId)
    .maybeSingle();

  if (profileError || !profile) {
    return baseResult;
  }

  if (!profile.is_active) {
    return {
      ...baseResult,
      role: profile.role as Role,
    };
  }

  const role = profile.role as Role;
  const canViewSensitive = Boolean((profile as any).can_view_sensitive);

  if (role === 'admin') {
    return {
      allowed: true,
      role,
      can_view_sensitive: canViewSensitive,
    };
  }

  if (role === 'client_manager') {
    const { data, error } = await supabase
      .from('vehicle_assignments')
      .select('vehicle_id, client_id, user_client_access!inner(user_id, client_id)')
      .eq('vehicle_id', vehicleId)
      .eq('user_client_access.user_id', userId)
      .limit(1);

    if (!error && data && data.length > 0) {
      return {
        allowed: true,
        role,
        can_view_sensitive: canViewSensitive,
      };
    }

    return {
      allowed: false,
      role,
      can_view_sensitive: canViewSensitive,
    };
  }

  if (role === 'owner' || role === 'driver' || role === 'staff') {
    const { data, error } = await supabase
      .from('user_vehicle_access')
      .select('vehicle_id')
      .eq('vehicle_id', vehicleId)
      .eq('user_id', userId)
      .limit(1);

    if (!error && data && data.length > 0) {
      return {
        allowed: true,
        role,
        can_view_sensitive: canViewSensitive,
      };
    }

    return {
      allowed: false,
      role,
      can_view_sensitive: canViewSensitive,
    };
  }

  return {
    allowed: false,
    role,
    can_view_sensitive: canViewSensitive,
  };
}

