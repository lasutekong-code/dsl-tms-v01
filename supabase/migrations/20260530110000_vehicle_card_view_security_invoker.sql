-- Security Advisor: vehicle_card_view used SECURITY DEFINER (owner postgres), bypassing caller RLS.
-- Use security_invoker so permissions and RLS apply as the querying user.
-- https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view

ALTER VIEW public.vehicle_card_view SET (security_invoker = true);
