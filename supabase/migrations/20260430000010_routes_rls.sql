-- RLS Policies for Routes and Route Assignments

ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

-- Drivers can read/update their own routes
CREATE POLICY "drivers_can_read_own_routes" ON public.routes
FOR SELECT
USING (driver_id = (SELECT id FROM public.drivers WHERE id = auth.uid()));

CREATE POLICY "drivers_can_update_own_routes" ON public.routes
FOR UPDATE
USING (driver_id = (SELECT id FROM public.drivers WHERE id = auth.uid()))
WITH CHECK (driver_id = (SELECT id FROM public.drivers WHERE id = auth.uid()));

-- Students can read routes they're assigned to
CREATE POLICY "students_can_read_assigned_routes" ON public.routes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.route_assignments ra
    WHERE ra.route_id = routes.id AND ra.student_id = auth.uid()
  )
);

-- Admins can read/update all routes
CREATE POLICY "admin_can_read_all_routes" ON public.routes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.id = auth.uid() AND admin_users.is_active = TRUE
  )
);

CREATE POLICY "admin_can_update_routes" ON public.routes
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.id = auth.uid() AND admin_users.is_active = TRUE
  )
);

-- Route Assignments RLS
ALTER TABLE public.route_assignments ENABLE ROW LEVEL SECURITY;

-- Students can read their own assignments
CREATE POLICY "students_can_read_own_assignments" ON public.route_assignments
FOR SELECT
USING (student_id = auth.uid());

-- Drivers can read/update assignments on their routes
CREATE POLICY "drivers_can_read_route_assignments" ON public.route_assignments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.routes r
    WHERE r.id = route_assignments.route_id
    AND r.driver_id = (SELECT id FROM public.drivers WHERE id = auth.uid())
  )
);

CREATE POLICY "drivers_can_update_route_assignments" ON public.route_assignments
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.routes r
    WHERE r.id = route_assignments.route_id
    AND r.driver_id = (SELECT id FROM public.drivers WHERE id = auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.routes r
    WHERE r.id = route_assignments.route_id
    AND r.driver_id = (SELECT id FROM public.drivers WHERE id = auth.uid())
  )
);

-- Admins can read/update all
CREATE POLICY "admin_can_read_all_assignments" ON public.route_assignments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.id = auth.uid() AND admin_users.is_active = TRUE
  )
);

CREATE POLICY "admin_can_update_assignments" ON public.route_assignments
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.id = auth.uid() AND admin_users.is_active = TRUE
  )
);
