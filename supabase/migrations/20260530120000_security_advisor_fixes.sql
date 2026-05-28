-- Security Advisor remediation (function search_path, RPC grants, RLS, pg_trgm schema)

-- ---------------------------------------------------------------------------
-- 1. Functions: immutable search_path
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'driver'),
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_expiring_insurances(days_ahead integer DEFAULT 30)
RETURNS TABLE(vehicle_id uuid, vehicle_no text, insurer text, renewal_date date, days_left integer)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT
    v.id,
    v.vehicle_no,
    i.insurance_company,
    i.renewal_date,
    (i.renewal_date - CURRENT_DATE)::int AS days_left
  FROM public.vehicles v
  JOIN public.insurances i ON i.vehicle_id = v.id
  WHERE i.renewal_date BETWEEN CURRENT_DATE AND CURRENT_DATE + days_ahead
  ORDER BY i.renewal_date;
$$;

CREATE OR REPLACE FUNCTION public.get_expiring_contracts(days_ahead integer DEFAULT 30)
RETURNS TABLE(vehicle_id uuid, vehicle_no text, contract_type text, end_date date, days_left integer)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT
    v.id,
    v.vehicle_no,
    c.contract_type,
    c.contract_end_date,
    (c.contract_end_date - CURRENT_DATE)::int AS days_left
  FROM public.vehicles v
  JOIN public.contracts c ON c.vehicle_id = v.id
  WHERE c.status = 'active'
    AND c.contract_end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + days_ahead
  ORDER BY c.contract_end_date;
$$;

-- ---------------------------------------------------------------------------
-- 2. Revoke public RPC execute on internal / trigger / admin-only functions
-- ---------------------------------------------------------------------------

REVOKE ALL ON FUNCTION public.grant_data_api_access(regclass) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.grant_data_api_access(regclass) TO postgres, service_role;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.is_active_admin() FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.get_expiring_insurances(integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_expiring_contracts(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_expiring_insurances(integer) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_expiring_contracts(integer) TO authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 3. account_requests: tighten INSERT policy (no WITH CHECK true)
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS account_requests_insert_public ON public.account_requests;

CREATE POLICY account_requests_insert_public
  ON public.account_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    status = 'pending'
    AND reviewed_by IS NULL
    AND reviewed_at IS NULL
    AND request_type IN ('signup', 'find_id', 'find_password')
    AND char_length(trim(email)) > 3
    AND char_length(trim(coalesce(name, ''))) >= 1
    AND (role IS NULL OR role IN ('client_manager', 'owner', 'driver', 'staff'))
    AND (profile_id IS NULL OR profile_id = auth.uid())
  );

DROP POLICY IF EXISTS account_requests_select_admin ON public.account_requests;
CREATE POLICY account_requests_select_admin
  ON public.account_requests
  FOR SELECT
  TO authenticated
  USING (public.is_active_admin());

DROP POLICY IF EXISTS account_requests_update_admin ON public.account_requests;
CREATE POLICY account_requests_update_admin
  ON public.account_requests
  FOR UPDATE
  TO authenticated
  USING (public.is_active_admin())
  WITH CHECK (public.is_active_admin());

-- ---------------------------------------------------------------------------
-- 4. Move pg_trgm out of public schema
-- ---------------------------------------------------------------------------

CREATE SCHEMA IF NOT EXISTS extensions;

ALTER EXTENSION pg_trgm SET SCHEMA extensions;

DROP INDEX IF EXISTS public.idx_vehicles_no;
DROP INDEX IF EXISTS public.idx_clients_name;
DROP INDEX IF EXISTS public.idx_drivers_name;

CREATE INDEX idx_vehicles_no ON public.vehicles USING gin (vehicle_no extensions.gin_trgm_ops);
CREATE INDEX idx_clients_name ON public.clients USING gin (client_name extensions.gin_trgm_ops);
CREATE INDEX idx_drivers_name ON public.drivers USING gin (driver_name extensions.gin_trgm_ops);
