-- Admin upload fixes, memos for drivers, contract types, driver RRN

-- Driver memos: vehicle_id optional when driver_id is set
ALTER TABLE public.memos
  ALTER COLUMN vehicle_id DROP NOT NULL;

ALTER TABLE public.memos
  DROP CONSTRAINT IF EXISTS memos_target_check;

ALTER TABLE public.memos
  ADD CONSTRAINT memos_target_check
  CHECK (vehicle_id IS NOT NULL OR driver_id IS NOT NULL);

-- Driver resident registration number (encrypted at application layer)
ALTER TABLE public.drivers
  ADD COLUMN IF NOT EXISTS resident_registration_number text;

-- Contract types: 위수탁 / 차량용역 / 화주물량
ALTER TABLE public.contracts
  DROP CONSTRAINT IF EXISTS contracts_contract_type_check;

UPDATE public.contracts
SET contract_type = 'vehicle_service'
WHERE contract_type = 'service';

ALTER TABLE public.contracts
  ADD CONSTRAINT contracts_contract_type_check
  CHECK (contract_type = ANY (ARRAY['consignment'::text, 'vehicle_service'::text, 'shipper_cargo'::text]));

ALTER TABLE public.contracts
  DROP CONSTRAINT IF EXISTS contracts_status_check;

ALTER TABLE public.contracts
  ADD CONSTRAINT contracts_status_check
  CHECK (status = ANY (ARRAY['active'::text, 'terminated'::text, 'expired'::text]));

-- Contract file storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('contract-files', 'contract-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage: allow authenticated admins to upsert (update) photo objects
DROP POLICY IF EXISTS "vehicle-photos: 인증 사용자 수정" ON storage.objects;
CREATE POLICY "vehicle-photos: 인증 사용자 수정"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'vehicle-photos')
  WITH CHECK (bucket_id = 'vehicle-photos');

DROP POLICY IF EXISTS "driver-photos: 인증 사용자 수정" ON storage.objects;
CREATE POLICY "driver-photos: 인증 사용자 수정"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'driver-photos')
  WITH CHECK (bucket_id = 'driver-photos');

DROP POLICY IF EXISTS "contract-files: admin insert" ON storage.objects;
CREATE POLICY "contract-files: admin insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'contract-files' AND (SELECT private.is_active_admin()));

DROP POLICY IF EXISTS "contract-files: admin update" ON storage.objects;
CREATE POLICY "contract-files: admin update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'contract-files' AND (SELECT private.is_active_admin()))
  WITH CHECK (bucket_id = 'contract-files');

DROP POLICY IF EXISTS "contract-files: admin select" ON storage.objects;
CREATE POLICY "contract-files: admin select"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'contract-files' AND (SELECT private.is_active_admin()));

DROP POLICY IF EXISTS "contract-files: admin delete" ON storage.objects;
CREATE POLICY "contract-files: admin delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'contract-files' AND (SELECT private.is_active_admin()));
