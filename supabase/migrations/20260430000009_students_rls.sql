-- RLS Policies for Students Table

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Students can read their own record
CREATE POLICY "students_can_read_own" ON public.students
FOR SELECT
USING (auth.uid() = id);

-- Drivers can read students on their routes
CREATE POLICY "drivers_can_read_students_on_routes" ON public.students
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.route_assignments ra
    JOIN public.routes r ON r.id = ra.route_id
    WHERE ra.student_id = students.id
    AND r.driver_id = (SELECT id FROM public.drivers WHERE id = auth.uid())
  )
);

-- Admins can read all
CREATE POLICY "admin_can_read_all_students" ON public.students
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.id = auth.uid() AND admin_users.is_active = TRUE
  )
);

-- Students can update their own profile
CREATE POLICY "students_can_update_own" ON public.students
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admins can update students
CREATE POLICY "admin_can_update_students" ON public.students
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.id = auth.uid() AND admin_users.is_active = TRUE
  )
);
