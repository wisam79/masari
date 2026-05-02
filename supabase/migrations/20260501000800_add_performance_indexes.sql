-- Performance indexes for foreign keys and frequently queried columns

-- users
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users USING btree (role);

-- driver_institutions
CREATE INDEX IF NOT EXISTS idx_driver_institutions_driver_id ON public.driver_institutions USING btree (driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_institutions_institution_id ON public.driver_institutions USING btree (institution_id);

-- student_profiles
CREATE INDEX IF NOT EXISTS idx_student_profiles_institution_id ON public.student_profiles USING btree (institution_id);

-- student_driver_link
CREATE INDEX IF NOT EXISTS idx_student_driver_link_student_id ON public.student_driver_link USING btree (student_id);
CREATE INDEX IF NOT EXISTS idx_student_driver_link_driver_id ON public.student_driver_link USING btree (driver_id);
CREATE INDEX IF NOT EXISTS idx_student_driver_link_institution_id ON public.student_driver_link USING btree (institution_id);
CREATE INDEX IF NOT EXISTS idx_student_driver_link_is_active ON public.student_driver_link USING btree (is_active);

-- subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_student_id ON public.subscriptions USING btree (student_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_driver_id ON public.subscriptions USING btree (driver_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_institution_id ON public.subscriptions USING btree (institution_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions USING btree (status);

-- daily_attendance
CREATE INDEX IF NOT EXISTS idx_daily_attendance_student_id ON public.daily_attendance USING btree (student_id);
CREATE INDEX IF NOT EXISTS idx_daily_attendance_driver_id ON public.daily_attendance USING btree (driver_id);
CREATE INDEX IF NOT EXISTS idx_daily_attendance_institution_id ON public.daily_attendance USING btree (institution_id);
CREATE INDEX IF NOT EXISTS idx_daily_attendance_date ON public.daily_attendance USING btree (date);
CREATE INDEX IF NOT EXISTS idx_daily_attendance_status ON public.daily_attendance USING btree (status);

-- driver_locations
-- Note: driver_id has a unique constraint, which implicitly creates a unique btree index.
CREATE INDEX IF NOT EXISTS idx_driver_locations_last_updated ON public.driver_locations USING btree (last_updated);
