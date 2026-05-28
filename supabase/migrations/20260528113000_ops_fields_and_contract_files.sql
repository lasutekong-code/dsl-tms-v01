-- Operational fields and contract file support

ALTER TABLE public.vehicle_assignments
  ADD COLUMN IF NOT EXISTS operation_time text,
  ADD COLUMN IF NOT EXISTS manager_name text;

UPDATE public.vehicle_assignments
SET operation_time = coalesce(operation_time, '')
WHERE operation_time IS NULL;

ALTER TABLE public.vehicle_assignments
  ALTER COLUMN operation_time SET DEFAULT '',
  ALTER COLUMN operation_time SET NOT NULL;

ALTER TABLE public.contracts
  ADD COLUMN IF NOT EXISTS contract_file_bucket text,
  ADD COLUMN IF NOT EXISTS contract_file_path text,
  ADD COLUMN IF NOT EXISTS contract_file_name text,
  ADD COLUMN IF NOT EXISTS contract_file_mime text;

ALTER TABLE public.insurances
  ADD COLUMN IF NOT EXISTS insurance_rate_text text;

UPDATE public.insurances
SET insurance_rate_text = insurance_rate::text
WHERE insurance_rate_text IS NULL
  AND insurance_rate IS NOT NULL;

ALTER TABLE public.memos
  ADD COLUMN IF NOT EXISTS driver_id uuid;

CREATE INDEX IF NOT EXISTS idx_vehicle_assignments_vehicle_client_runtime
  ON public.vehicle_assignments(vehicle_id, client_id, operation_time);

CREATE INDEX IF NOT EXISTS idx_memos_driver_id
  ON public.memos(driver_id);
