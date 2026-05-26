-- DSL TMS v01 — Supabase schema (column names are the source of truth for the app)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE public.user_role AS ENUM (
  'admin',
  'manager',
  'dispatcher',
  'driver',
  'viewer'
);

CREATE TABLE public.users (
  id SERIAL PRIMARY KEY,
  auth_user_id UUID UNIQUE REFERENCES auth.users (id) ON DELETE SET NULL,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role public.user_role NOT NULL DEFAULT 'viewer',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by INT4 REFERENCES public.users (id),
  updated_by INT4 REFERENCES public.users (id),
  deleted_at TIMESTAMPTZ,
  deleted_by INT4 REFERENCES public.users (id)
);

CREATE TABLE public.drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INT4 REFERENCES public.users (id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  driver_license_number TEXT,
  birth_date DATE,
  address TEXT,
  photo_path TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by INT4 REFERENCES public.users (id),
  updated_by INT4 REFERENCES public.users (id),
  deleted_at TIMESTAMPTZ,
  deleted_by INT4 REFERENCES public.users (id)
);

CREATE INDEX idx_users_auth_user_id ON public.users (auth_user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role ON public.users (role) WHERE deleted_at IS NULL;
CREATE INDEX idx_drivers_user_id ON public.drivers (user_id) WHERE deleted_at IS NULL;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

COMMENT ON COLUMN public.drivers.driver_license_number IS 'PII — visible only to admin/manager';
COMMENT ON COLUMN public.drivers.birth_date IS 'PII — visible only to admin/manager';
COMMENT ON COLUMN public.drivers.address IS 'PII — visible only to admin/manager';
COMMENT ON COLUMN public.drivers.photo_path IS 'Storage path — served via signed URL';
