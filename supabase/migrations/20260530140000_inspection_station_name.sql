ALTER TABLE public.vehicle_inspections
  ADD COLUMN IF NOT EXISTS inspection_station_name text;
