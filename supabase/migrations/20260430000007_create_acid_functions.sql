-- Migration: Create ACID Transaction Functions
-- Date: 2026-04-30
-- Description: Create stored procedures for financial transactions with atomicity

-- Function 1: Process Subscription Payment (ACID)
CREATE OR REPLACE FUNCTION public.process_subscription_payment(
  p_subscription_id UUID,
  p_amount_iqd BIGINT,
  p_payment_method VARCHAR(50) DEFAULT 'manual'
)
RETURNS JSONB AS $$
DECLARE
  v_student_id UUID;
  v_current_status subscription_status;
  v_base_price BIGINT;
  v_discount BIGINT;
  v_final_price BIGINT;
  v_company_commission BIGINT := 20000;
  v_driver_profit BIGINT := 70000;
  v_driver_id UUID;
  v_route_id UUID;
BEGIN
  -- Lock subscription for atomicity
  SELECT 
    student_id, status, base_price_iqd, discount_iqd, final_price_iqd
  INTO 
    v_student_id, v_current_status, v_base_price, v_discount, v_final_price
  FROM public.subscriptions
  WHERE id = p_subscription_id
  FOR UPDATE;

  -- Validate subscription exists
  IF v_student_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'Subscription not found'
    );
  END IF;

  -- Validate status is pending
  IF v_current_status != 'pending' THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'Subscription is not pending'
    );
  END IF;

  -- Validate amount matches final price
  IF p_amount_iqd != v_final_price THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'Payment amount does not match subscription price',
      'expected', v_final_price,
      'received', p_amount_iqd
    );
  END IF;

  -- Get the driver for this route (if exists)
  SELECT d.id INTO v_driver_id
  FROM public.drivers d
  JOIN public.routes r ON r.driver_id = d.id
  JOIN public.route_assignments ra ON ra.route_id = r.id
  WHERE ra.student_id = v_student_id
  LIMIT 1;

  -- Create payment record
  INSERT INTO public.payments (subscription_id, student_id, driver_id, amount_iqd, payment_type, status, payment_method)
  VALUES (p_subscription_id, v_student_id, v_driver_id, v_final_price, 'subscription'::payment_type_enum, 'completed'::payment_status_enum, p_payment_method)
  ON CONFLICT DO NOTHING;

  -- Update subscription to paid
  UPDATE public.subscriptions
  SET 
    status = 'paid'::subscription_status,
    payment_date = NOW(),
    payment_method = p_payment_method
  WHERE id = p_subscription_id;

  -- Update student subscription status
  UPDATE public.students
  SET monthly_subscription_status = 'active'
  WHERE id = v_student_id;

  -- If driver exists, update driver's net profit
  IF v_driver_id IS NOT NULL THEN
    UPDATE public.drivers
    SET net_profit_iqd = net_profit_iqd + v_driver_profit
    WHERE id = v_driver_id;
  END IF;

  RETURN jsonb_build_object(
    'success', TRUE,
    'subscription_id', p_subscription_id,
    'student_id', v_student_id,
    'amount_paid', v_final_price,
    'timestamp', NOW()
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', FALSE,
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql;

-- Function 2: Apply Referral Code (ACID)
CREATE OR REPLACE FUNCTION public.apply_referral_code(
  p_subscription_id UUID,
  p_referral_code VARCHAR(50)
)
RETURNS JSONB AS $$
DECLARE
  v_student_id UUID;
  v_discount_amount BIGINT;
  v_current_usage INT;
  v_max_usage INT;
  v_referrer_id UUID;
BEGIN
  -- Lock subscription
  SELECT student_id INTO v_student_id
  FROM public.subscriptions
  WHERE id = p_subscription_id
  FOR UPDATE;

  -- Validate subscription exists
  IF v_student_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'Subscription not found'
    );
  END IF;

  -- Validate referral code
  SELECT discount_amount_iqd, usage_count, max_usage, student_id
  INTO v_discount_amount, v_current_usage, v_max_usage, v_referrer_id
  FROM public.referral_codes
  WHERE code = p_referral_code AND is_active = TRUE
  FOR UPDATE;

  -- Validate code exists
  IF v_discount_amount IS NULL THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'Invalid or inactive referral code'
    );
  END IF;

  -- Check usage limits
  IF v_max_usage IS NOT NULL AND v_current_usage >= v_max_usage THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'Referral code usage limit exceeded'
    );
  END IF;

  -- Apply discount to subscription
  UPDATE public.subscriptions
  SET 
    discount_iqd = discount_iqd + v_discount_amount,
    final_price_iqd = base_price_iqd - (discount_iqd + v_discount_amount)
  WHERE id = p_subscription_id;

  -- Increment referral code usage
  UPDATE public.referral_codes
  SET usage_count = usage_count + 1
  WHERE code = p_referral_code;

  -- Update referring student's profile
  UPDATE public.students
  SET referral_code = p_referral_code
  WHERE id = v_student_id;

  RETURN jsonb_build_object(
    'success', TRUE,
    'subscription_id', p_subscription_id,
    'discount_applied', v_discount_amount,
    'referrer_id', v_referrer_id,
    'timestamp', NOW()
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', FALSE,
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql;

-- Function 3: Complete Route (ACID)
CREATE OR REPLACE FUNCTION public.complete_route(
  p_route_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_driver_id UUID;
  v_students_present INT;
  v_students_absent INT;
  v_gross_revenue BIGINT;
  v_company_commission BIGINT;
  v_driver_profit BIGINT;
BEGIN
  -- Lock route
  SELECT driver_id INTO v_driver_id
  FROM public.routes
  WHERE id = p_route_id
  FOR UPDATE;

  -- Validate route exists
  IF v_driver_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'Route not found'
    );
  END IF;

  -- Count present and absent students
  SELECT 
    COUNT(CASE WHEN status != 'absent'::assignment_status THEN 1 END),
    COUNT(CASE WHEN status = 'absent'::assignment_status THEN 1 END)
  INTO v_students_present, v_students_absent
  FROM public.route_assignments
  WHERE route_id = p_route_id;

  -- Calculate financials (per student: 90,000 IQD = 20,000 commission + 70,000 profit)
  v_gross_revenue := v_students_present * 90000;
  v_company_commission := v_students_present * 20000;
  v_driver_profit := v_students_present * 70000;

  -- Update route
  UPDATE public.routes
  SET 
    status = 'completed'::route_status,
    total_students_present = v_students_present,
    total_students_absent = v_students_absent,
    gross_revenue_iqd = v_gross_revenue
  WHERE id = p_route_id;

  -- Update driver's net profit and completed routes
  UPDATE public.drivers
  SET 
    net_profit_iqd = net_profit_iqd + v_driver_profit,
    total_routes_completed = total_routes_completed + 1,
    total_students_served = total_students_served + v_students_present
  WHERE id = v_driver_id;

  RETURN jsonb_build_object(
    'success', TRUE,
    'route_id', p_route_id,
    'driver_id', v_driver_id,
    'students_present', v_students_present,
    'students_absent', v_students_absent,
    'gross_revenue', v_gross_revenue,
    'driver_profit', v_driver_profit,
    'timestamp', NOW()
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', FALSE,
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql;
