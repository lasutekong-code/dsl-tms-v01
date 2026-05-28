-- Fix Supabase Security Advisor warning:
-- authenticated_security_definer_function_executable_public_is_active_admin_
--
-- The proposed advisor SQL references public.admin_users, but this project
-- stores admin state in public.profiles. Keep the existing admin semantics and
-- move the SECURITY DEFINER helper out of the exposed public API schema.

CREATE SCHEMA IF NOT EXISTS private;

REVOKE ALL ON SCHEMA private FROM PUBLIC;
REVOKE ALL ON SCHEMA private FROM anon;
REVOKE ALL ON SCHEMA private FROM authenticated;

CREATE OR REPLACE FUNCTION private.is_active_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT COALESCE(
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = (select auth.uid())
        AND p.role = 'admin'
        AND p.is_active = true
    ),
    false
  );
$$;

REVOKE ALL ON FUNCTION private.is_active_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.is_active_admin() FROM anon;
REVOKE ALL ON FUNCTION private.is_active_admin() FROM authenticated;
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_active_admin() TO authenticated;
GRANT USAGE ON SCHEMA private TO service_role;
GRANT EXECUTE ON FUNCTION private.is_active_admin() TO service_role;

DO $$
DECLARE
  policy_row record;
  next_qual text;
  next_check text;
  alter_sql text;
BEGIN
  FOR policy_row IN
    SELECT schemaname, tablename, policyname, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (
        qual LIKE '%is_active_admin()%'
        OR with_check LIKE '%is_active_admin()%'
      )
  LOOP
    next_qual := replace(policy_row.qual, 'is_active_admin()', 'private.is_active_admin()');
    next_check := replace(policy_row.with_check, 'is_active_admin()', 'private.is_active_admin()');

    alter_sql := format(
      'ALTER POLICY %I ON %I.%I',
      policy_row.policyname,
      policy_row.schemaname,
      policy_row.tablename
    );

    IF next_qual IS NOT NULL THEN
      alter_sql := alter_sql || format(' USING (%s)', next_qual);
    END IF;

    IF next_check IS NOT NULL THEN
      alter_sql := alter_sql || format(' WITH CHECK (%s)', next_check);
    END IF;

    EXECUTE alter_sql;
  END LOOP;
END
$$;

REVOKE ALL ON FUNCTION public.is_active_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_active_admin() FROM anon;
REVOKE ALL ON FUNCTION public.is_active_admin() FROM authenticated;
REVOKE ALL ON FUNCTION public.is_active_admin() FROM service_role;
DROP FUNCTION IF EXISTS public.is_active_admin();
