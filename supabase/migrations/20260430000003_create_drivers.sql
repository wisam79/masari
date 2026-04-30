-- Migration: Create Drivers Table
-- Date: 2026-04-30
-- Description: Create drivers with vehicle and financial tracking

CREATE TABLE public.drivers (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  vehicle_plate_number VARCHAR(50) UNIQUE NOT NULL,
  vehicle_color_ar VARCHAR(100),
  vehicle_capacity INT NOT NULL,
  national_id_number VARCHAR(50) UNIQUE NOT NULL,
  bank_account_number VARCHAR(100),
  total_routes_completed INT DEFAULT 0,
  total_students_served INT DEFAULT 0,
  net_profit_iqd BIGINT DEFAULT 0,
  is_approved BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_drivers_is_approved ON public.drivers(is_approved);
CREATE INDEX idx_drivers_vehicle_plate ON public.drivers(vehicle_plate_number);
CREATE INDEX idx_drivers_national_id ON public.drivers(national_id_number);

CREATE TRIGGER trigger_update_drivers_updated_at
BEFORE UPDATE ON public.drivers
FOR EACH ROW
EXECUTE FUNCTION public.update_timestamp();
