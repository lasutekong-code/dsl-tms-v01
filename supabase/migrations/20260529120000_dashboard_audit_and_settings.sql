-- Admin dashboard editable content
CREATE TABLE IF NOT EXISTS public.admin_dashboard_settings (
  id text PRIMARY KEY DEFAULT 'default',
  quick_guide text NOT NULL DEFAULT '거래처 → 센터 → 담당자 순으로 등록하면 연계 선택이 수월합니다.',
  photo_guide text NOT NULL DEFAULT '차량 사진은 차량 수정 화면 하단에서, 운전자 사진은 운전자 수정 화면에서 업로드할 수 있습니다.',
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES public.profiles(id)
);

ALTER TABLE public.admin_dashboard_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS admin_dashboard_settings_select_admin ON public.admin_dashboard_settings;
CREATE POLICY admin_dashboard_settings_select_admin
  ON public.admin_dashboard_settings FOR SELECT TO authenticated
  USING ((SELECT private.is_active_admin()));

DROP POLICY IF EXISTS admin_dashboard_settings_update_admin ON public.admin_dashboard_settings;
CREATE POLICY admin_dashboard_settings_update_admin
  ON public.admin_dashboard_settings FOR UPDATE TO authenticated
  USING ((SELECT private.is_active_admin()))
  WITH CHECK ((SELECT private.is_active_admin()));

DROP POLICY IF EXISTS admin_dashboard_settings_insert_admin ON public.admin_dashboard_settings;
CREATE POLICY admin_dashboard_settings_insert_admin
  ON public.admin_dashboard_settings FOR INSERT TO authenticated
  WITH CHECK ((SELECT private.is_active_admin()));

INSERT INTO public.admin_dashboard_settings (id)
VALUES ('default')
ON CONFLICT (id) DO NOTHING;

-- Audit log columns used by the app
ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS user_id uuid,
  ADD COLUMN IF NOT EXISTS target_table text,
  ADD COLUMN IF NOT EXISTS target_id uuid,
  ADD COLUMN IF NOT EXISTS metadata jsonb;

CREATE INDEX IF NOT EXISTS idx_audit_logs_target
  ON public.audit_logs(target_table, target_id, created_at DESC);
