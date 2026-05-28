-- Resolve Supabase Performance Advisor index notices.
-- Foreign key columns need supporting indexes for efficient parent updates and
-- deletes. Indexes reported as unused are removed to reduce write
-- overhead and keep the advisor signal clean.

-- account_requests
CREATE INDEX IF NOT EXISTS idx_account_requests_profile_id
  ON public.account_requests (profile_id);
CREATE INDEX IF NOT EXISTS idx_account_requests_reviewed_by
  ON public.account_requests (reviewed_by);
DROP INDEX IF EXISTS public.account_requests_email_idx;

-- addresses
CREATE INDEX IF NOT EXISTS idx_addresses_owner_id
  ON public.addresses (owner_id);
CREATE INDEX IF NOT EXISTS idx_addresses_driver_id
  ON public.addresses (driver_id);

-- centers
CREATE INDEX IF NOT EXISTS idx_centers_client_id
  ON public.centers (client_id);

-- client_contacts
CREATE INDEX IF NOT EXISTS idx_client_contacts_client_id
  ON public.client_contacts (client_id);
CREATE INDEX IF NOT EXISTS idx_client_contacts_center_id
  ON public.client_contacts (center_id);
CREATE INDEX IF NOT EXISTS idx_client_contacts_profile_id
  ON public.client_contacts (profile_id);

-- contracts
CREATE INDEX IF NOT EXISTS idx_contracts_owner_id
  ON public.contracts (owner_id);
CREATE INDEX IF NOT EXISTS idx_contracts_client_id
  ON public.contracts (client_id);
DROP INDEX IF EXISTS public.idx_contracts_type_status;

-- driver_photos
CREATE INDEX IF NOT EXISTS idx_driver_photos_driver_id
  ON public.driver_photos (driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_photos_uploaded_by
  ON public.driver_photos (uploaded_by);

-- drivers
CREATE INDEX IF NOT EXISTS idx_drivers_profile_id
  ON public.drivers (profile_id);

-- memos
CREATE INDEX IF NOT EXISTS idx_memos_vehicle_id
  ON public.memos (vehicle_id);
CREATE INDEX IF NOT EXISTS idx_memos_created_by
  ON public.memos (created_by);

-- owners
CREATE INDEX IF NOT EXISTS idx_owners_profile_id
  ON public.owners (profile_id);

-- user_client_access
CREATE INDEX IF NOT EXISTS idx_user_client_access_client_id
  ON public.user_client_access (client_id);
CREATE INDEX IF NOT EXISTS idx_user_client_access_center_id
  ON public.user_client_access (center_id);
CREATE INDEX IF NOT EXISTS idx_user_client_access_granted_by
  ON public.user_client_access (granted_by);

-- user_vehicle_access
CREATE INDEX IF NOT EXISTS idx_user_vehicle_access_vehicle_id
  ON public.user_vehicle_access (vehicle_id);
CREATE INDEX IF NOT EXISTS idx_user_vehicle_access_granted_by
  ON public.user_vehicle_access (granted_by);

-- vehicle_assignments
CREATE INDEX IF NOT EXISTS idx_vehicle_assignments_center_id
  ON public.vehicle_assignments (center_id);
DROP INDEX IF EXISTS public.idx_vehicle_assignments_current;

-- vehicle_photos
CREATE INDEX IF NOT EXISTS idx_vehicle_photos_uploaded_by
  ON public.vehicle_photos (uploaded_by);

-- Unused search/log indexes reported by the advisor.
DROP INDEX IF EXISTS public.idx_vehicles_no;
DROP INDEX IF EXISTS public.idx_clients_name;
DROP INDEX IF EXISTS public.idx_drivers_name;
DROP INDEX IF EXISTS public.idx_audit_logs_created;
