-- RLS Policies for Financial Tables (Subscriptions, Payments, Referrals)

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Students can read their own subscriptions
CREATE POLICY "students_can_read_own_subscriptions" ON public.subscriptions
FOR SELECT
USING (student_id = auth.uid());

-- Drivers can read subscriptions for students on their routes
CREATE POLICY "drivers_can_read_student_subscriptions" ON public.subscriptions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.route_assignments ra
    JOIN public.routes r ON r.id = ra.route_id
    WHERE ra.student_id = subscriptions.student_id
    AND r.driver_id = (SELECT id FROM public.drivers WHERE id = auth.uid())
  )
);

-- Admins can read all
CREATE POLICY "admin_can_read_all_subscriptions" ON public.subscriptions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.id = auth.uid() AND admin_users.is_active = TRUE
  )
);

-- Admins can update subscriptions
CREATE POLICY "admin_can_update_subscriptions" ON public.subscriptions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.id = auth.uid() AND admin_users.is_active = TRUE
  )
);

-- Payments RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Students can read their own payments
CREATE POLICY "students_can_read_own_payments" ON public.payments
FOR SELECT
USING (student_id = auth.uid());

-- Drivers can read payments for their routes
CREATE POLICY "drivers_can_read_route_payments" ON public.payments
FOR SELECT
USING (driver_id = auth.uid());

-- Admins can read all
CREATE POLICY "admin_can_read_all_payments" ON public.payments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.id = auth.uid() AND admin_users.is_active = TRUE
  )
);

-- Referral Codes RLS
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

-- Students can read referral codes (for applying them)
CREATE POLICY "referral_codes_readable" ON public.referral_codes
FOR SELECT
USING (is_active = TRUE);

-- Admins can manage all referral codes
CREATE POLICY "admin_can_manage_referral_codes" ON public.referral_codes
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.id = auth.uid() AND admin_users.is_active = TRUE
  )
);
