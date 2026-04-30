-- Migration: Create Schools and Students Tables
-- Date: 2026-04-30
-- Description: Create schools and students with location data

CREATE TABLE public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  address_ar TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  phone VARCHAR(20),
  principal_name_ar VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_schools_is_active ON public.schools(is_active);

CREATE TRIGGER trigger_update_schools_updated_at
BEFORE UPDATE ON public.schools
FOR EACH ROW
EXECUTE FUNCTION public.update_timestamp();

-- Students table
CREATE TABLE public.students (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  parent_phone VARCHAR(20),
  parent_name_ar VARCHAR(255),
  home_location_address_ar TEXT,
  home_location_latitude DECIMAL(10, 8),
  home_location_longitude DECIMAL(11, 8),
  school_location_address_ar TEXT,
  monthly_subscription_status VARCHAR(50) DEFAULT 'inactive'
    CHECK (monthly_subscription_status IN ('active', 'inactive', 'paused', 'cancelled')),
  referral_code VARCHAR(50) UNIQUE,
  referred_by_student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_students_school_id ON public.students(school_id);
CREATE INDEX idx_students_subscription_status ON public.students(monthly_subscription_status);
CREATE INDEX idx_students_referral_code ON public.students(referral_code);
CREATE INDEX idx_students_referred_by ON public.students(referred_by_student_id);

CREATE TRIGGER trigger_update_students_updated_at
BEFORE UPDATE ON public.students
FOR EACH ROW
EXECUTE FUNCTION public.update_timestamp();
