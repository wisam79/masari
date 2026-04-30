-- Migration: Create Routes and Route Assignments
-- Date: 2026-04-30
-- Description: Create route management and state tracking

CREATE TYPE route_status AS ENUM ('inactive', 'active', 'completed', 'cancelled');
CREATE TYPE assignment_status AS ENUM ('pending', 'driver_waiting', 'in_transit', 'completed', 'absent');

CREATE TABLE public.routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE RESTRICT,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE RESTRICT,
  route_name_ar VARCHAR(255) NOT NULL,
  status route_status NOT NULL DEFAULT 'inactive',
  
  -- Estimated timing (in minutes)
  estimated_pickup_start_time TIME,
  estimated_pickup_end_time TIME,
  estimated_arrival_time TIME,
  
  -- Financial tracking per route
  total_students_assigned INT DEFAULT 0,
  total_students_present INT DEFAULT 0,
  total_students_absent INT DEFAULT 0,
  gross_revenue_iqd BIGINT DEFAULT 0,
  
  route_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_routes_driver_id ON public.routes(driver_id);
CREATE INDEX idx_routes_school_id ON public.routes(school_id);
CREATE INDEX idx_routes_status ON public.routes(status);
CREATE INDEX idx_routes_route_date ON public.routes(route_date);

CREATE TRIGGER trigger_update_routes_updated_at
BEFORE UPDATE ON public.routes
FOR EACH ROW
EXECUTE FUNCTION public.update_timestamp();

-- Route Assignments Table
CREATE TABLE public.route_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  status assignment_status NOT NULL DEFAULT 'pending',
  
  -- State timestamps
  driver_arrived_at_door_time TIMESTAMP WITH TIME ZONE,
  pickup_time TIMESTAMP WITH TIME ZONE,
  dropoff_time TIMESTAMP WITH TIME ZONE,
  
  is_absent BOOLEAN DEFAULT FALSE,
  absence_reason_ar TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(route_id, student_id)
);

CREATE INDEX idx_route_assignments_route_id ON public.route_assignments(route_id);
CREATE INDEX idx_route_assignments_student_id ON public.route_assignments(student_id);
CREATE INDEX idx_route_assignments_status ON public.route_assignments(status);

CREATE TRIGGER trigger_update_route_assignments_updated_at
BEFORE UPDATE ON public.route_assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_timestamp();
