-- RLS Policies for Users Table
-- Users can see their own record
-- Admins can see all records

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Public SELECT: Users can see their own record
CREATE POLICY "users_can_read_own_profile" ON public.users
FOR SELECT
USING (auth.uid() = id);

-- Admin SELECT: Admins can see all
CREATE POLICY "admin_can_read_all_users" ON public.users
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.id = auth.uid() AND admin_users.is_active = TRUE
  )
);

-- Users can update their own profile (but not role)
CREATE POLICY "users_can_update_own_profile" ON public.users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.users WHERE id = auth.uid()));

-- Admin can update any user
CREATE POLICY "admin_can_update_users" ON public.users
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.id = auth.uid() AND admin_users.is_active = TRUE
  )
);
