-- audit_logs.action was limited to view/export/update/delete while the app logs entity-specific actions.
ALTER TABLE public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_action_check;

-- Ensure admins can read audit history (remote may already have policies using private.is_active_admin).
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS audit_logs_select_admin ON public.audit_logs;
CREATE POLICY audit_logs_select_admin
  ON public.audit_logs FOR SELECT TO authenticated
  USING ((SELECT private.is_active_admin()));
