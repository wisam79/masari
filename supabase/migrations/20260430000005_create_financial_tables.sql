-- Migration: Create Financial Tables (Subscriptions, Payments, Referrals)
-- Date: 2026-04-30
-- Description: Create financial tracking and payment management

CREATE TYPE subscription_status AS ENUM ('pending', 'paid', 'cancelled', 'refunded');
CREATE TYPE payment_type_enum AS ENUM ('subscription', 'commission', 'refund');
CREATE TYPE payment_status_enum AS ENUM ('pending', 'completed', 'failed');

-- Subscriptions Table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL UNIQUE REFERENCES public.students(id) ON DELETE CASCADE,
  subscription_month DATE NOT NULL,
  base_price_iqd BIGINT NOT NULL DEFAULT 90000,
  discount_iqd BIGINT DEFAULT 0,
  final_price_iqd BIGINT NOT NULL,
  
  status subscription_status NOT NULL DEFAULT 'pending',
  
  payment_date TIMESTAMP WITH TIME ZONE,
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_student_id ON public.subscriptions(student_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_month ON public.subscriptions(subscription_month);

CREATE TRIGGER trigger_update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_timestamp();

-- Referral Codes Table
CREATE TABLE public.referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_amount_iqd BIGINT DEFAULT 5000,
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INT DEFAULT 0,
  max_usage INT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX idx_referral_codes_student_id ON public.referral_codes(student_id);
CREATE INDEX idx_referral_codes_is_active ON public.referral_codes(is_active);

CREATE TRIGGER trigger_update_referral_codes_updated_at
BEFORE UPDATE ON public.referral_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_timestamp();

-- Payments Table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE RESTRICT,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  
  amount_iqd BIGINT NOT NULL,
  payment_type payment_type_enum NOT NULL,
  
  status payment_status_enum NOT NULL DEFAULT 'pending',
  
  payment_method VARCHAR(50),
  external_transaction_id VARCHAR(255),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payments_subscription_id ON public.payments(subscription_id);
CREATE INDEX idx_payments_student_id ON public.payments(student_id);
CREATE INDEX idx_payments_driver_id ON public.payments(driver_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_payment_type ON public.payments(payment_type);

CREATE TRIGGER trigger_update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_timestamp();

-- Financial Summaries Table
CREATE TABLE public.financial_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  summary_type VARCHAR(50) NOT NULL 
    CHECK (summary_type IN ('student', 'driver', 'admin')),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  summary_month DATE NOT NULL,
  
  -- For students
  total_subscriptions_paid_iqd BIGINT DEFAULT 0,
  total_routes_completed INT DEFAULT 0,
  
  -- For drivers
  gross_revenue_iqd BIGINT DEFAULT 0,
  company_commission_iqd BIGINT DEFAULT 0,
  net_profit_iqd BIGINT DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(summary_type, user_id, summary_month)
);

CREATE INDEX idx_financial_summaries_user_id ON public.financial_summaries(user_id);
CREATE INDEX idx_financial_summaries_month ON public.financial_summaries(summary_month);

CREATE TRIGGER trigger_update_financial_summaries_updated_at
BEFORE UPDATE ON public.financial_summaries
FOR EACH ROW
EXECUTE FUNCTION public.update_timestamp();
