-- Optimize RLS policies flagged by Supabase Performance Advisor.
-- auth.uid() calls are wrapped in scalar subqueries so Postgres can evaluate
-- them once per statement, and overlapping permissive policies are merged per
-- table/role/action.

CREATE OR REPLACE FUNCTION public.is_active_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = (select auth.uid())
      AND role = 'admin'
      AND is_active = true
  );
$$;

REVOKE ALL ON FUNCTION public.is_active_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_active_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_active_admin() TO service_role;

-- account_requests
DROP POLICY IF EXISTS "account_requests_insert_public" ON public.account_requests;

CREATE POLICY "account_requests_insert_public"
  ON public.account_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    status = 'pending'::text
    AND reviewed_by IS NULL
    AND reviewed_at IS NULL
    AND request_type = ANY (ARRAY['signup'::text, 'find_id'::text, 'find_password'::text])
    AND char_length(TRIM(BOTH FROM email)) > 3
    AND char_length(TRIM(BOTH FROM COALESCE(name, ''::text))) >= 1
    AND (role IS NULL OR role = ANY (ARRAY['client_manager'::text, 'owner'::text, 'driver'::text, 'staff'::text]))
    AND (profile_id IS NULL OR profile_id = (select auth.uid()))
  );

-- addresses
DROP POLICY IF EXISTS "addresses: 관리자 전체" ON public.addresses;
DROP POLICY IF EXISTS "addresses: 사업주 본인 조회" ON public.addresses;
DROP POLICY IF EXISTS "addresses: 운전자 본인 조회" ON public.addresses;
DROP POLICY IF EXISTS "addresses: 거래처담당자 민감정보 조회" ON public.addresses;
DROP POLICY IF EXISTS "addresses_select_access" ON public.addresses;
DROP POLICY IF EXISTS "addresses_insert_admin" ON public.addresses;
DROP POLICY IF EXISTS "addresses_update_admin" ON public.addresses;
DROP POLICY IF EXISTS "addresses_delete_admin" ON public.addresses;

CREATE POLICY "addresses_select_access"
  ON public.addresses
  FOR SELECT
  TO authenticated
  USING (
    (select public.is_active_admin())
    OR owner_id IN (
      SELECT o.id
      FROM public.owners o
      WHERE o.profile_id = (select auth.uid())
    )
    OR driver_id IN (
      SELECT d.id
      FROM public.drivers d
      WHERE d.profile_id = (select auth.uid())
    )
    OR EXISTS (
      SELECT 1
      FROM public.vehicle_assignments va
      JOIN public.user_client_access uca ON uca.client_id = va.client_id
      WHERE uca.profile_id = (select auth.uid())
        AND uca.can_view_sensitive = true
        AND va.is_current = true
        AND (va.owner_id = addresses.owner_id OR va.driver_id = addresses.driver_id)
    )
  );

CREATE POLICY "addresses_insert_admin"
  ON public.addresses
  FOR INSERT
  TO authenticated
  WITH CHECK ((select public.is_active_admin()));

CREATE POLICY "addresses_update_admin"
  ON public.addresses
  FOR UPDATE
  TO authenticated
  USING ((select public.is_active_admin()))
  WITH CHECK ((select public.is_active_admin()));

CREATE POLICY "addresses_delete_admin"
  ON public.addresses
  FOR DELETE
  TO authenticated
  USING ((select public.is_active_admin()));

-- audit_logs
DROP POLICY IF EXISTS "audit_logs: 관리자 전체" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs: 본인 로그 삽입" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_select_admin" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_insert_access" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_update_admin" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_delete_admin" ON public.audit_logs;

CREATE POLICY "audit_logs_select_admin"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING ((select public.is_active_admin()));

CREATE POLICY "audit_logs_insert_access"
  ON public.audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK ((select public.is_active_admin()) OR profile_id = (select auth.uid()));

CREATE POLICY "audit_logs_update_admin"
  ON public.audit_logs
  FOR UPDATE
  TO authenticated
  USING ((select public.is_active_admin()))
  WITH CHECK ((select public.is_active_admin()));

CREATE POLICY "audit_logs_delete_admin"
  ON public.audit_logs
  FOR DELETE
  TO authenticated
  USING ((select public.is_active_admin()));

-- centers
DROP POLICY IF EXISTS "centers: 관리자 전체" ON public.centers;
DROP POLICY IF EXISTS "centers: 담당 거래처 센터 조회" ON public.centers;
DROP POLICY IF EXISTS "centers_select_access" ON public.centers;
DROP POLICY IF EXISTS "centers_insert_admin" ON public.centers;
DROP POLICY IF EXISTS "centers_update_admin" ON public.centers;
DROP POLICY IF EXISTS "centers_delete_admin" ON public.centers;

CREATE POLICY "centers_select_access"
  ON public.centers
  FOR SELECT
  TO authenticated
  USING (
    (select public.is_active_admin())
    OR EXISTS (
      SELECT 1
      FROM public.user_client_access uca
      WHERE uca.client_id = centers.client_id
        AND uca.profile_id = (select auth.uid())
    )
  );

CREATE POLICY "centers_insert_admin"
  ON public.centers
  FOR INSERT
  TO authenticated
  WITH CHECK ((select public.is_active_admin()));

CREATE POLICY "centers_update_admin"
  ON public.centers
  FOR UPDATE
  TO authenticated
  USING ((select public.is_active_admin()))
  WITH CHECK ((select public.is_active_admin()));

CREATE POLICY "centers_delete_admin"
  ON public.centers
  FOR DELETE
  TO authenticated
  USING ((select public.is_active_admin()));

-- client_contacts
DROP POLICY IF EXISTS "client_contacts: 관리자 전체" ON public.client_contacts;
DROP POLICY IF EXISTS "client_contacts_select_admin" ON public.client_contacts;
DROP POLICY IF EXISTS "client_contacts_insert_admin" ON public.client_contacts;
DROP POLICY IF EXISTS "client_contacts_update_admin" ON public.client_contacts;
DROP POLICY IF EXISTS "client_contacts_delete_admin" ON public.client_contacts;

CREATE POLICY "client_contacts_select_admin"
  ON public.client_contacts
  FOR SELECT
  TO authenticated
  USING ((select public.is_active_admin()));

CREATE POLICY "client_contacts_insert_admin"
  ON public.client_contacts
  FOR INSERT
  TO authenticated
  WITH CHECK ((select public.is_active_admin()));

CREATE POLICY "client_contacts_update_admin"
  ON public.client_contacts
  FOR UPDATE
  TO authenticated
  USING ((select public.is_active_admin()))
  WITH CHECK ((select public.is_active_admin()));

CREATE POLICY "client_contacts_delete_admin"
  ON public.client_contacts
  FOR DELETE
  TO authenticated
  USING ((select public.is_active_admin()));

-- clients
DROP POLICY IF EXISTS "clients: 관리자 전체" ON public.clients;
DROP POLICY IF EXISTS "clients: 담당 거래처 조회" ON public.clients;
DROP POLICY IF EXISTS "clients_select_access" ON public.clients;
DROP POLICY IF EXISTS "clients_insert_admin" ON public.clients;
DROP POLICY IF EXISTS "clients_update_admin" ON public.clients;
DROP POLICY IF EXISTS "clients_delete_admin" ON public.clients;

CREATE POLICY "clients_select_access"
  ON public.clients
  FOR SELECT
  TO authenticated
  USING (
    (select public.is_active_admin())
    OR EXISTS (
      SELECT 1
      FROM public.user_client_access uca
      WHERE uca.client_id = clients.id
        AND uca.profile_id = (select auth.uid())
    )
  );

CREATE POLICY "clients_insert_admin"
  ON public.clients
  FOR INSERT
  TO authenticated
  WITH CHECK ((select public.is_active_admin()));

CREATE POLICY "clients_update_admin"
  ON public.clients
  FOR UPDATE
  TO authenticated
  USING ((select public.is_active_admin()))
  WITH CHECK ((select public.is_active_admin()));

CREATE POLICY "clients_delete_admin"
  ON public.clients
  FOR DELETE
  TO authenticated
  USING ((select public.is_active_admin()));

-- contracts
DROP POLICY IF EXISTS "contracts: 관리자 전체" ON public.contracts;
DROP POLICY IF EXISTS "contracts: 사업주 본인 차량 계약" ON public.contracts;
DROP POLICY IF EXISTS "contracts_select_access" ON public.contracts;
DROP POLICY IF EXISTS "contracts_insert_admin" ON public.contracts;
DROP POLICY IF EXISTS "contracts_update_admin" ON public.contracts;
DROP POLICY IF EXISTS "contracts_delete_admin" ON public.contracts;

CREATE POLICY "contracts_select_access"
  ON public.contracts
  FOR SELECT
  TO authenticated
  USING (
    (select public.is_active_admin())
    OR owner_id IN (
      SELECT o.id
      FROM public.owners o
      WHERE o.profile_id = (select auth.uid())
    )
  );

CREATE POLICY "contracts_insert_admin"
  ON public.contracts
  FOR INSERT
  TO authenticated
  WITH CHECK ((select public.is_active_admin()));

CREATE POLICY "contracts_update_admin"
  ON public.contracts
  FOR UPDATE
  TO authenticated
  USING ((select public.is_active_admin()))
  WITH CHECK ((select public.is_active_admin()));

CREATE POLICY "contracts_delete_admin"
  ON public.contracts
  FOR DELETE
  TO authenticated
  USING ((select public.is_active_admin()));

-- driver_photos
DROP POLICY IF EXISTS "driver_photos: 관리자 전체" ON public.driver_photos;
DROP POLICY IF EXISTS "driver_photos: 본인 조회" ON public.driver_photos;
DROP POLICY IF EXISTS "driver_photos: 허가 차량 조회" ON public.driver_photos;
DROP POLICY IF EXISTS "driver_photos_select_access" ON public.driver_photos;
DROP POLICY IF EXISTS "driver_photos_insert_admin" ON public.driver_photos;
DROP POLICY IF EXISTS "driver_photos_update_admin" ON public.driver_photos;
DROP POLICY IF EXISTS "driver_photos_delete_admin" ON public.driver_photos;

CREATE POLICY "driver_photos_select_access"
  ON public.driver_photos
  FOR SELECT
  TO authenticated
  USING (
    (select public.is_active_admin())
    OR EXISTS (
      SELECT 1
      FROM public.drivers d
      WHERE d.id = driver_photos.driver_id
        AND d.profile_id = (select auth.uid())
    )
    OR EXISTS (
      SELECT 1
      FROM public.vehicle_assignments va
      WHERE va.driver_id = driver_photos.driver_id
        AND va.is_current = true
        AND (
          EXISTS (
            SELECT 1
            FROM public.user_client_access uca
            WHERE uca.client_id = va.client_id
              AND uca.profile_id = (select auth.uid())
          )
          OR EXISTS (
            SELECT 1
            FROM public.user_vehicle_access uva
            WHERE uva.vehicle_id = va.vehicle_id
              AND uva.profile_id = (select auth.uid())
          )
        )
    )
  );

CREATE POLICY "driver_photos_insert_admin"
  ON public.driver_photos
  FOR INSERT
  TO authenticated
  WITH CHECK ((select public.is_active_admin()));

CREATE POLICY "driver_photos_update_admin"
  ON public.driver_photos
  FOR UPDATE
  TO authenticated
  USING ((select public.is_active_admin()))
  WITH CHECK ((select public.is_active_admin()));

CREATE POLICY "driver_photos_delete_admin"
  ON public.driver_photos
  FOR DELETE
  TO authenticated
  USING ((select public.is_active_admin()));

-- drivers
DROP POLICY IF EXISTS "drivers: 관리자 전체" ON public.drivers;
DROP POLICY IF EXISTS "drivers: 본인 조회" ON public.drivers;
DROP POLICY IF EXISTS "drivers: 허가 차량 조회 (거래처담당자·사업주)" ON public.drivers;
DROP POLICY IF EXISTS "drivers_select_access" ON public.drivers;
DROP POLICY IF EXISTS "drivers_insert_admin" ON public.drivers;
DROP POLICY IF EXISTS "drivers_update_admin" ON public.drivers;
DROP POLICY IF EXISTS "drivers_delete_admin" ON public.drivers;

CREATE POLICY "drivers_select_access"
  ON public.drivers
  FOR SELECT
  TO authenticated
  USING (
    (select public.is_active_admin())
    OR profile_id = (select auth.uid())
    OR EXISTS (
      SELECT 1
      FROM public.vehicle_assignments va
      WHERE va.driver_id = drivers.id
        AND va.is_current = true
        AND (
          EXISTS (
            SELECT 1
            FROM public.user_client_access uca
            WHERE uca.client_id = va.client_id
              AND uca.profile_id = (select auth.uid())
          )
          OR EXISTS (
            SELECT 1
            FROM public.user_vehicle_access uva
            WHERE uva.vehicle_id = va.vehicle_id
              AND uva.profile_id = (select auth.uid())
          )
        )
    )
  );

CREATE POLICY "drivers_insert_admin"
  ON public.drivers
  FOR INSERT
  TO authenticated
  WITH CHECK ((select public.is_active_admin()));

CREATE POLICY "drivers_update_admin"
  ON public.drivers
  FOR UPDATE
  TO authenticated
  USING ((select public.is_active_admin()))
  WITH CHECK ((select public.is_active_admin()));

CREATE POLICY "drivers_delete_admin"
  ON public.drivers
  FOR DELETE
  TO authenticated
  USING ((select public.is_active_admin()));

-- insurances
DROP POLICY IF EXISTS "insurances: 관리자 전체" ON public.insurances;
DROP POLICY IF EXISTS "insurances: 허가 차량 조회" ON public.insurances;
DROP POLICY IF EXISTS "insurances_select_access" ON public.insurances;
DROP POLICY IF EXISTS "insurances_insert_admin" ON public.insurances;
DROP POLICY IF EXISTS "insurances_update_admin" ON public.insurances;
DROP POLICY IF EXISTS "insurances_delete_admin" ON public.insurances;

CREATE POLICY "insurances_select_access"
  ON public.insurances
  FOR SELECT
  TO authenticated
  USING (
    (select public.is_active_admin())
    OR EXISTS (
      SELECT 1
      FROM public.user_vehicle_access uva
      WHERE uva.vehicle_id = insurances.vehicle_id
        AND uva.profile_id = (select auth.uid())
    )
    OR EXISTS (
      SELECT 1
      FROM public.vehicle_assignments va
      JOIN public.user_client_access uca ON uca.client_id = va.client_id
      WHERE va.vehicle_id = insurances.vehicle_id
        AND va.is_current = true
        AND uca.profile_id = (select auth.uid())
        AND uca.can_view_sensitive = true
    )
  );

CREATE POLICY "insurances_insert_admin"
  ON public.insurances
  FOR INSERT
  TO authenticated
  WITH CHECK ((select public.is_active_admin()));

CREATE POLICY "insurances_update_admin"
  ON public.insurances
  FOR UPDATE
  TO authenticated
  USING ((select public.is_active_admin()))
  WITH CHECK ((select public.is_active_admin()));

CREATE POLICY "insurances_delete_admin"
  ON public.insurances
  FOR DELETE
  TO authenticated
  USING ((select public.is_active_admin()));

-- memos
DROP POLICY IF EXISTS "memos: 관리자 전체" ON public.memos;
DROP POLICY IF EXISTS "memos: shared 공개 메모" ON public.memos;
DROP POLICY IF EXISTS "memos: internal 내부 메모 (staff 이상)" ON public.memos;
DROP POLICY IF EXISTS "memos_select_access" ON public.memos;
DROP POLICY IF EXISTS "memos_insert_admin" ON public.memos;
DROP POLICY IF EXISTS "memos_update_admin" ON public.memos;
DROP POLICY IF EXISTS "memos_delete_admin" ON public.memos;

CREATE POLICY "memos_select_access"
  ON public.memos
  FOR SELECT
  TO authenticated
  USING (
    (select public.is_active_admin())
    OR (
      visibility = 'shared'::text
      AND EXISTS (
        SELECT 1
        FROM public.user_vehicle_access uva
        WHERE uva.vehicle_id = memos.vehicle_id
          AND uva.profile_id = (select auth.uid())
      )
    )
    OR (
      visibility = ANY (ARRAY['internal'::text, 'shared'::text])
      AND EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = (select auth.uid())
          AND p.role = ANY (ARRAY['admin'::text, 'staff'::text])
          AND p.is_active = true
      )
    )
  );

CREATE POLICY "memos_insert_admin"
  ON public.memos
  FOR INSERT
  TO authenticated
  WITH CHECK ((select public.is_active_admin()));

CREATE POLICY "memos_update_admin"
  ON public.memos
  FOR UPDATE
  TO authenticated
  USING ((select public.is_active_admin()))
  WITH CHECK ((select public.is_active_admin()));

CREATE POLICY "memos_delete_admin"
  ON public.memos
  FOR DELETE
  TO authenticated
  USING ((select public.is_active_admin()));

-- owners
DROP POLICY IF EXISTS "owners: 관리자 전체" ON public.owners;
DROP POLICY IF EXISTS "owners: 본인 조회" ON public.owners;
DROP POLICY IF EXISTS "owners_select_access" ON public.owners;
DROP POLICY IF EXISTS "owners_insert_admin" ON public.owners;
DROP POLICY IF EXISTS "owners_update_admin" ON public.owners;
DROP POLICY IF EXISTS "owners_delete_admin" ON public.owners;

CREATE POLICY "owners_select_access"
  ON public.owners
  FOR SELECT
  TO authenticated
  USING ((select public.is_active_admin()) OR profile_id = (select auth.uid()));

CREATE POLICY "owners_insert_admin"
  ON public.owners
  FOR INSERT
  TO authenticated
  WITH CHECK ((select public.is_active_admin()));

CREATE POLICY "owners_update_admin"
  ON public.owners
  FOR UPDATE
  TO authenticated
  USING ((select public.is_active_admin()))
  WITH CHECK ((select public.is_active_admin()));

CREATE POLICY "owners_delete_admin"
  ON public.owners
  FOR DELETE
  TO authenticated
  USING ((select public.is_active_admin()));

-- profiles
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_access" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_access" ON public.profiles;

CREATE POLICY "profiles_select_access"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = (select auth.uid()) OR (select public.is_active_admin()));

CREATE POLICY "profiles_insert_access"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = (select auth.uid()) OR (select public.is_active_admin()));

CREATE POLICY "profiles_update_admin"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING ((select public.is_active_admin()))
  WITH CHECK ((select public.is_active_admin()));

CREATE POLICY "profiles_delete_admin"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING ((select public.is_active_admin()));

-- search_logs
DROP POLICY IF EXISTS "search_logs: 관리자 전체" ON public.search_logs;
DROP POLICY IF EXISTS "search_logs: 본인 로그 삽입" ON public.search_logs;
DROP POLICY IF EXISTS "search_logs_select_admin" ON public.search_logs;
DROP POLICY IF EXISTS "search_logs_insert_access" ON public.search_logs;
DROP POLICY IF EXISTS "search_logs_update_admin" ON public.search_logs;
DROP POLICY IF EXISTS "search_logs_delete_admin" ON public.search_logs;

CREATE POLICY "search_logs_select_admin"
  ON public.search_logs
  FOR SELECT
  TO authenticated
  USING ((select public.is_active_admin()));

CREATE POLICY "search_logs_insert_access"
  ON public.search_logs
  FOR INSERT
  TO authenticated
  WITH CHECK ((select public.is_active_admin()) OR profile_id = (select auth.uid()));

CREATE POLICY "search_logs_update_admin"
  ON public.search_logs
  FOR UPDATE
  TO authenticated
  USING ((select public.is_active_admin()))
  WITH CHECK ((select public.is_active_admin()));

CREATE POLICY "search_logs_delete_admin"
  ON public.search_logs
  FOR DELETE
  TO authenticated
  USING ((select public.is_active_admin()));

-- user_client_access
DROP POLICY IF EXISTS "user_client_access: 관리자 전체" ON public.user_client_access;
DROP POLICY IF EXISTS "user_client_access: 본인 권한 조회" ON public.user_client_access;
DROP POLICY IF EXISTS "user_client_access_select_access" ON public.user_client_access;
DROP POLICY IF EXISTS "user_client_access_insert_admin" ON public.user_client_access;
DROP POLICY IF EXISTS "user_client_access_update_admin" ON public.user_client_access;
DROP POLICY IF EXISTS "user_client_access_delete_admin" ON public.user_client_access;

CREATE POLICY "user_client_access_select_access"
  ON public.user_client_access
  FOR SELECT
  TO authenticated
  USING ((select public.is_active_admin()) OR profile_id = (select auth.uid()));

CREATE POLICY "user_client_access_insert_admin"
  ON public.user_client_access
  FOR INSERT
  TO authenticated
  WITH CHECK ((select public.is_active_admin()));

CREATE POLICY "user_client_access_update_admin"
  ON public.user_client_access
  FOR UPDATE
  TO authenticated
  USING ((select public.is_active_admin()))
  WITH CHECK ((select public.is_active_admin()));

CREATE POLICY "user_client_access_delete_admin"
  ON public.user_client_access
  FOR DELETE
  TO authenticated
  USING ((select public.is_active_admin()));

-- user_vehicle_access
DROP POLICY IF EXISTS "user_vehicle_access: 관리자 전체" ON public.user_vehicle_access;
DROP POLICY IF EXISTS "user_vehicle_access: 본인 권한 조회" ON public.user_vehicle_access;
DROP POLICY IF EXISTS "user_vehicle_access_select_access" ON public.user_vehicle_access;
DROP POLICY IF EXISTS "user_vehicle_access_insert_admin" ON public.user_vehicle_access;
DROP POLICY IF EXISTS "user_vehicle_access_update_admin" ON public.user_vehicle_access;
DROP POLICY IF EXISTS "user_vehicle_access_delete_admin" ON public.user_vehicle_access;

CREATE POLICY "user_vehicle_access_select_access"
  ON public.user_vehicle_access
  FOR SELECT
  TO authenticated
  USING ((select public.is_active_admin()) OR profile_id = (select auth.uid()));

CREATE POLICY "user_vehicle_access_insert_admin"
  ON public.user_vehicle_access
  FOR INSERT
  TO authenticated
  WITH CHECK ((select public.is_active_admin()));

CREATE POLICY "user_vehicle_access_update_admin"
  ON public.user_vehicle_access
  FOR UPDATE
  TO authenticated
  USING ((select public.is_active_admin()))
  WITH CHECK ((select public.is_active_admin()));

CREATE POLICY "user_vehicle_access_delete_admin"
  ON public.user_vehicle_access
  FOR DELETE
  TO authenticated
  USING ((select public.is_active_admin()));

-- vehicle_assignments
DROP POLICY IF EXISTS "vehicle_assignments: 관리자 전체" ON public.vehicle_assignments;
DROP POLICY IF EXISTS "vehicle_assignments: 허가 차량 조회" ON public.vehicle_assignments;
DROP POLICY IF EXISTS "vehicle_assignments_select_access" ON public.vehicle_assignments;
DROP POLICY IF EXISTS "vehicle_assignments_insert_admin" ON public.vehicle_assignments;
DROP POLICY IF EXISTS "vehicle_assignments_update_admin" ON public.vehicle_assignments;
DROP POLICY IF EXISTS "vehicle_assignments_delete_admin" ON public.vehicle_assignments;

CREATE POLICY "vehicle_assignments_select_access"
  ON public.vehicle_assignments
  FOR SELECT
  TO authenticated
  USING (
    (select public.is_active_admin())
    OR EXISTS (
      SELECT 1
      FROM public.user_vehicle_access uva
      WHERE uva.vehicle_id = vehicle_assignments.vehicle_id
        AND uva.profile_id = (select auth.uid())
    )
    OR EXISTS (
      SELECT 1
      FROM public.user_client_access uca
      WHERE uca.client_id = vehicle_assignments.client_id
        AND uca.profile_id = (select auth.uid())
    )
  );

CREATE POLICY "vehicle_assignments_insert_admin"
  ON public.vehicle_assignments
  FOR INSERT
  TO authenticated
  WITH CHECK ((select public.is_active_admin()));

CREATE POLICY "vehicle_assignments_update_admin"
  ON public.vehicle_assignments
  FOR UPDATE
  TO authenticated
  USING ((select public.is_active_admin()))
  WITH CHECK ((select public.is_active_admin()));

CREATE POLICY "vehicle_assignments_delete_admin"
  ON public.vehicle_assignments
  FOR DELETE
  TO authenticated
  USING ((select public.is_active_admin()));

-- vehicle_inspections
DROP POLICY IF EXISTS "vehicle_inspections: 관리자 전체" ON public.vehicle_inspections;
DROP POLICY IF EXISTS "vehicle_inspections: 허가 차량 조회" ON public.vehicle_inspections;
DROP POLICY IF EXISTS "vehicle_inspections_select_access" ON public.vehicle_inspections;
DROP POLICY IF EXISTS "vehicle_inspections_insert_admin" ON public.vehicle_inspections;
DROP POLICY IF EXISTS "vehicle_inspections_update_admin" ON public.vehicle_inspections;
DROP POLICY IF EXISTS "vehicle_inspections_delete_admin" ON public.vehicle_inspections;

CREATE POLICY "vehicle_inspections_select_access"
  ON public.vehicle_inspections
  FOR SELECT
  TO authenticated
  USING (
    (select public.is_active_admin())
    OR EXISTS (
      SELECT 1
      FROM public.user_vehicle_access uva
      WHERE uva.vehicle_id = vehicle_inspections.vehicle_id
        AND uva.profile_id = (select auth.uid())
    )
    OR EXISTS (
      SELECT 1
      FROM public.vehicle_assignments va
      JOIN public.user_client_access uca ON uca.client_id = va.client_id
      WHERE va.vehicle_id = vehicle_inspections.vehicle_id
        AND va.is_current = true
        AND uca.profile_id = (select auth.uid())
    )
  );

CREATE POLICY "vehicle_inspections_insert_admin"
  ON public.vehicle_inspections
  FOR INSERT
  TO authenticated
  WITH CHECK ((select public.is_active_admin()));

CREATE POLICY "vehicle_inspections_update_admin"
  ON public.vehicle_inspections
  FOR UPDATE
  TO authenticated
  USING ((select public.is_active_admin()))
  WITH CHECK ((select public.is_active_admin()));

CREATE POLICY "vehicle_inspections_delete_admin"
  ON public.vehicle_inspections
  FOR DELETE
  TO authenticated
  USING ((select public.is_active_admin()));

-- vehicle_photos
DROP POLICY IF EXISTS "vehicle_photos: 관리자 전체" ON public.vehicle_photos;
DROP POLICY IF EXISTS "vehicle_photos: 허가 차량 조회" ON public.vehicle_photos;
DROP POLICY IF EXISTS "vehicle_photos_select_access" ON public.vehicle_photos;
DROP POLICY IF EXISTS "vehicle_photos_insert_admin" ON public.vehicle_photos;
DROP POLICY IF EXISTS "vehicle_photos_update_admin" ON public.vehicle_photos;
DROP POLICY IF EXISTS "vehicle_photos_delete_admin" ON public.vehicle_photos;

CREATE POLICY "vehicle_photos_select_access"
  ON public.vehicle_photos
  FOR SELECT
  TO authenticated
  USING (
    (select public.is_active_admin())
    OR EXISTS (
      SELECT 1
      FROM public.vehicles v
      WHERE v.id = vehicle_photos.vehicle_id
        AND (
          EXISTS (
            SELECT 1
            FROM public.vehicle_assignments va
            JOIN public.user_client_access uca ON uca.client_id = va.client_id
            WHERE va.vehicle_id = v.id
              AND va.is_current = true
              AND uca.profile_id = (select auth.uid())
          )
          OR EXISTS (
            SELECT 1
            FROM public.user_vehicle_access uva
            WHERE uva.vehicle_id = v.id
              AND uva.profile_id = (select auth.uid())
          )
        )
    )
  );

CREATE POLICY "vehicle_photos_insert_admin"
  ON public.vehicle_photos
  FOR INSERT
  TO authenticated
  WITH CHECK ((select public.is_active_admin()));

CREATE POLICY "vehicle_photos_update_admin"
  ON public.vehicle_photos
  FOR UPDATE
  TO authenticated
  USING ((select public.is_active_admin()))
  WITH CHECK ((select public.is_active_admin()));

CREATE POLICY "vehicle_photos_delete_admin"
  ON public.vehicle_photos
  FOR DELETE
  TO authenticated
  USING ((select public.is_active_admin()));

-- vehicle_specs
DROP POLICY IF EXISTS "vehicle_specs: 관리자 전체" ON public.vehicle_specs;
DROP POLICY IF EXISTS "vehicle_specs: 허가 차량 조회" ON public.vehicle_specs;
DROP POLICY IF EXISTS "vehicle_specs_select_access" ON public.vehicle_specs;
DROP POLICY IF EXISTS "vehicle_specs_insert_admin" ON public.vehicle_specs;
DROP POLICY IF EXISTS "vehicle_specs_update_admin" ON public.vehicle_specs;
DROP POLICY IF EXISTS "vehicle_specs_delete_admin" ON public.vehicle_specs;

CREATE POLICY "vehicle_specs_select_access"
  ON public.vehicle_specs
  FOR SELECT
  TO authenticated
  USING (
    (select public.is_active_admin())
    OR EXISTS (
      SELECT 1
      FROM public.vehicles v
      WHERE v.id = vehicle_specs.vehicle_id
        AND (
          EXISTS (
            SELECT 1
            FROM public.vehicle_assignments va
            JOIN public.user_client_access uca ON uca.client_id = va.client_id
            WHERE va.vehicle_id = v.id
              AND va.is_current = true
              AND uca.profile_id = (select auth.uid())
          )
          OR EXISTS (
            SELECT 1
            FROM public.user_vehicle_access uva
            WHERE uva.vehicle_id = v.id
              AND uva.profile_id = (select auth.uid())
          )
        )
    )
  );

CREATE POLICY "vehicle_specs_insert_admin"
  ON public.vehicle_specs
  FOR INSERT
  TO authenticated
  WITH CHECK ((select public.is_active_admin()));

CREATE POLICY "vehicle_specs_update_admin"
  ON public.vehicle_specs
  FOR UPDATE
  TO authenticated
  USING ((select public.is_active_admin()))
  WITH CHECK ((select public.is_active_admin()));

CREATE POLICY "vehicle_specs_delete_admin"
  ON public.vehicle_specs
  FOR DELETE
  TO authenticated
  USING ((select public.is_active_admin()));

-- vehicles
DROP POLICY IF EXISTS "vehicles: 관리자 전체" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles: 거래처담당자 조회" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles: 사업주·운전자 조회" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_select_access" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_insert_admin" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_update_admin" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_delete_admin" ON public.vehicles;

CREATE POLICY "vehicles_select_access"
  ON public.vehicles
  FOR SELECT
  TO authenticated
  USING (
    (select public.is_active_admin())
    OR EXISTS (
      SELECT 1
      FROM public.vehicle_assignments va
      JOIN public.user_client_access uca ON uca.client_id = va.client_id
      WHERE va.vehicle_id = vehicles.id
        AND va.is_current = true
        AND uca.profile_id = (select auth.uid())
    )
    OR EXISTS (
      SELECT 1
      FROM public.user_vehicle_access uva
      WHERE uva.vehicle_id = vehicles.id
        AND uva.profile_id = (select auth.uid())
    )
  );

CREATE POLICY "vehicles_insert_admin"
  ON public.vehicles
  FOR INSERT
  TO authenticated
  WITH CHECK ((select public.is_active_admin()));

CREATE POLICY "vehicles_update_admin"
  ON public.vehicles
  FOR UPDATE
  TO authenticated
  USING ((select public.is_active_admin()))
  WITH CHECK ((select public.is_active_admin()));

CREATE POLICY "vehicles_delete_admin"
  ON public.vehicles
  FOR DELETE
  TO authenticated
  USING ((select public.is_active_admin()));
