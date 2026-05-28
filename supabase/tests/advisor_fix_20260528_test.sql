-- Verification SQL for advisor_fix_20260528.sql.
-- Run after applying the migration. These queries are read-only.

-- 1) public SECURITY DEFINER helper should no longer exist.
SELECT n.nspname AS schema_name, p.proname AS function_name, p.prosecdef AS security_definer
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname = 'is_active_admin';

-- 2) private helper should exist and remain SECURITY DEFINER for RLS recursion safety.
SELECT n.nspname AS schema_name, p.proname AS function_name, p.prosecdef AS security_definer
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'private'
  AND p.proname = 'is_active_admin';

-- 3) All public RLS policies should reference the private helper only.
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND (
    qual ILIKE '%is_active_admin%'
    OR with_check ILIKE '%is_active_admin%'
  )
ORDER BY tablename, policyname;

-- 4) The private helper must not be exposed through public RPC.
SELECT CASE
  WHEN to_regprocedure('public.is_active_admin()') IS NULL THEN false
  ELSE has_function_privilege('authenticated', to_regprocedure('public.is_active_admin()'), 'EXECUTE')
END AS authenticated_can_execute_public_helper;

-- 5) Security Advisor should no longer report:
-- authenticated_security_definer_function_executable_public_is_active_admin_
