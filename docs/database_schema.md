# Smart Transit Database Schema

**Last Updated:** April 30, 2026  
**Language:** Arabic (العربية) - Primary  
**Database:** PostgreSQL (Supabase)

---

## 📋 Overview

This document defines the complete PostgreSQL schema for the Smart Transit application. All financial values are stored as **integers** (smallest denomination) to ensure mathematical accuracy. All user-facing text must support **Arabic as the primary language with RTL layout**.

---

## 🗂️ Core Tables

### 1. `auth.users` (Supabase Auth)
- Managed by Supabase Authentication
- Contains `id` (UUID), `email`, `phone`, `confirmed_at`, etc.
- Integrates with `public.users` via foreign key

### 2. `public.users`
```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'driver', 'admin', 'unassigned')),
  phone_number VARCHAR(20) UNIQUE,
  full_name_ar VARCHAR(255) NOT NULL,
  full_name_en VARCHAR(255),
  profile_picture_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_role (role),
  INDEX idx_is_active (is_active),
  INDEX idx_created_at (created_at)
);
```

### 3. `public.students`
```sql
CREATE TABLE public.students (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES public.schools(id),
  parent_phone VARCHAR(20),
  parent_name_ar VARCHAR(255),
  home_location_address_ar TEXT,
  home_location_latitude DECIMAL(10, 8),
  home_location_longitude DECIMAL(11, 8),
  school_location_address_ar TEXT,
  monthly_subscription_status VARCHAR(50) DEFAULT 'inactive' 
    CHECK (subscription_status IN ('active', 'inactive', 'paused', 'cancelled')),
  referral_code VARCHAR(50) UNIQUE,
  referred_by_student_id UUID REFERENCES public.students(id),
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_school_id (school_id),
  INDEX idx_subscription_status (monthly_subscription_status),
  INDEX idx_referral_code (referral_code)
);
```

### 4. `public.drivers`
```sql
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
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_is_approved (is_approved),
  INDEX idx_vehicle_plate (vehicle_plate_number)
);
```

### 5. `public.schools`
```sql
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
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_is_active (is_active)
);
```

---

## 🚗 Route Management

### 6. `public.routes`
```sql
CREATE TABLE public.routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE RESTRICT,
  school_id UUID NOT NULL REFERENCES public.schools(id),
  route_name_ar VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'inactive'
    CHECK (status IN ('inactive', 'active', 'completed', 'cancelled')),
  
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
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_driver_id (driver_id),
  INDEX idx_school_id (school_id),
  INDEX idx_status (status),
  INDEX idx_route_date (route_date)
);
```

### 7. `public.route_assignments`
```sql
CREATE TABLE public.route_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'driver_waiting', 'in_transit', 'completed', 'absent')),
  
  -- State timestamps
  driver_arrived_at_door_time TIMESTAMP,
  pickup_time TIMESTAMP,
  dropoff_time TIMESTAMP,
  
  is_absent BOOLEAN DEFAULT FALSE,
  absence_reason_ar TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(route_id, student_id),
  INDEX idx_route_id (route_id),
  INDEX idx_student_id (student_id),
  INDEX idx_status (status)
);
```

---

## 💰 Financial Management

### 8. `public.subscriptions`
```sql
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL UNIQUE REFERENCES public.students(id) ON DELETE CASCADE,
  subscription_month DATE NOT NULL,
  base_price_iqd BIGINT NOT NULL DEFAULT 90000,
  discount_iqd BIGINT DEFAULT 0,
  final_price_iqd BIGINT NOT NULL,
  
  status VARCHAR(50) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'cancelled', 'refunded')),
  
  payment_date TIMESTAMP,
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_student_id (student_id),
  INDEX idx_status (status),
  INDEX idx_subscription_month (subscription_month)
);
```

### 9. `public.referral_codes`
```sql
CREATE TABLE public.referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_amount_iqd BIGINT DEFAULT 5000,
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INT DEFAULT 0,
  max_usage INT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_code (code),
  INDEX idx_student_id (student_id),
  INDEX idx_is_active (is_active)
);
```

### 10. `public.payments`
```sql
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE RESTRICT,
  student_id UUID NOT NULL REFERENCES public.students(id),
  driver_id UUID REFERENCES public.drivers(id),
  
  amount_iqd BIGINT NOT NULL,
  payment_type VARCHAR(50) NOT NULL 
    CHECK (payment_type IN ('subscription', 'commission', 'refund')),
  
  status VARCHAR(50) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'failed')),
  
  payment_method VARCHAR(50),
  external_transaction_id VARCHAR(255),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_subscription_id (subscription_id),
  INDEX idx_student_id (student_id),
  INDEX idx_driver_id (driver_id),
  INDEX idx_status (status)
);
```

### 11. `public.financial_summaries`
```sql
CREATE TABLE public.financial_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  summary_type VARCHAR(50) NOT NULL 
    CHECK (summary_type IN ('student', 'driver', 'admin')),
  user_id UUID NOT NULL REFERENCES public.users(id),
  summary_month DATE NOT NULL,
  
  -- For students
  total_subscriptions_paid_iqd BIGINT DEFAULT 0,
  total_routes_completed INT DEFAULT 0,
  
  -- For drivers
  gross_revenue_iqd BIGINT DEFAULT 0,
  company_commission_iqd BIGINT DEFAULT 0,
  net_profit_iqd BIGINT DEFAULT 0,
  total_routes_completed INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(summary_type, user_id, summary_month),
  INDEX idx_user_id (user_id),
  INDEX idx_summary_month (summary_month)
);
```

---

## 🔔 Notifications & Communication

### 12. `public.push_tokens`
```sql
CREATE TABLE public.push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  device_type VARCHAR(50) NOT NULL 
    CHECK (device_type IN ('ios', 'android', 'web')),
  token VARCHAR(500) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_user_id (user_id),
  INDEX idx_is_active (is_active)
);
```

### 13. `public.notification_queue`
```sql
CREATE TABLE public.notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title_ar VARCHAR(255) NOT NULL,
  title_en VARCHAR(255),
  body_ar TEXT NOT NULL,
  body_en TEXT,
  
  notification_type VARCHAR(100) NOT NULL,
  related_entity_id UUID,
  related_entity_type VARCHAR(50),
  
  is_sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP,
  retry_count INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_user_id (user_id),
  INDEX idx_is_sent (is_sent),
  INDEX idx_created_at (created_at)
);
```

---

## 🔐 Admin & Access Control

### 14. `public.admin_users`
```sql
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  admin_level VARCHAR(50) NOT NULL 
    CHECK (admin_level IN ('super_admin', 'admin', 'support')),
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_is_active (is_active)
);
```

---

## 📊 Audit & Logs

### 15. `public.audit_logs`
```sql
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.users(id),
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  changes JSONB,
  ip_address VARCHAR(45),
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_actor_id (actor_id),
  INDEX idx_entity_type (entity_type),
  INDEX idx_created_at (created_at)
);
```

---

## 🔄 Database Functions (ACID Transactions)

### Function 1: `process_subscription_payment()`
Atomically:
1. Validate subscription exists and is unpaid
2. Create payment record
3. Deduct commission from driver's net profit
4. Update student subscription status to 'paid'
5. Update financial summary

```sql
CREATE OR REPLACE FUNCTION process_subscription_payment(
  p_subscription_id UUID,
  p_amount_iqd BIGINT
)
RETURNS JSONB AS $$
BEGIN
  -- Implementation ensures all-or-nothing semantics
END;
$$ LANGUAGE plpgsql;
```

### Function 2: `apply_referral_code()`
Atomically:
1. Validate referral code is active and has uses remaining
2. Apply 5,000 IQD discount to subscriber
3. Increment referral code usage count
4. Update referring student's profile

### Function 3: `complete_route()`
Atomically:
1. Calculate total students present/absent
2. Calculate gross revenue (students × 90,000 IQD)
3. Deduct company commission (students × 20,000 IQD)
4. Update driver's net profit
5. Mark route as 'completed'

---

## 🛡️ Row Level Security (RLS) Policies

### Students Table
- Students can READ only their own record
- Students can UPDATE only their own profile fields (name, phone, etc.)
- Drivers can READ students on their assigned routes only
- Admins can READ/UPDATE all

### Drivers Table
- Drivers can READ only their own record + routes
- Drivers can UPDATE only their own profile
- Students can READ driver info for their assigned route only
- Admins can READ/UPDATE all

### Routes Table
- Drivers can READ/UPDATE only their own routes
- Students can READ routes they're assigned to
- Admins can READ/UPDATE all

### Subscriptions Table
- Students can READ only their own subscriptions
- Drivers can READ subscriptions for students on their routes
- Admins can READ/UPDATE all

---

## 📌 Indexes (Performance Optimization)

```sql
-- Already defined in table schemas, but summary:
- idx_role (users)
- idx_is_active (users, schools, push_tokens)
- idx_school_id (students)
- idx_subscription_status (students)
- idx_referral_code (students)
- idx_is_approved (drivers)
- idx_driver_id (routes)
- idx_school_id (routes)
- idx_status (routes, route_assignments)
- idx_route_date (routes)
- idx_student_id (route_assignments, subscriptions)
- idx_subscription_id (payments)
- idx_user_id (financial_summaries, audit_logs)
- idx_summary_month (financial_summaries)
```

---

## ⏰ Auto-Updated Timestamps

All tables include `updated_at` with automatic trigger:

```sql
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Applied to: users, students, drivers, schools, routes, route_assignments,
-- subscriptions, referral_codes, payments, financial_summaries, push_tokens,
-- notification_queue, admin_users
```

---

## ✅ Constraints Summary

- **Foreign Key Integrity:** All relationships enforced via FK constraints
- **Data Validation:** Check constraints for enums (role, status, etc.)
- **Uniqueness:** Enforced on phone, vehicle plate, referral codes, etc.
- **Cascading Deletes:** User deletion cascades to related tables
- **Soft Deletes:** `is_deleted` boolean used instead of hard deletes for audit trail

---

## 📋 Migration Strategy

1. Create all base tables (users → students → drivers → schools)
2. Create route and subscription tables
3. Create financial and notification tables
4. Create admin and audit tables
5. Create all indexes
6. Create all triggers for timestamps
7. Create RLS policies
8. Create stored procedures for transactions

**Status:** ⏳ Awaiting approval before Step 2 (Supabase Configuration)
