-- Seed script for Smart Transit

-- 1. Create Schools
INSERT INTO public.schools (id, name_ar, name_en, address_ar, latitude, longitude, phone, principal_name_ar)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  'مدرسة النور الابتدائية',
  'Al Noor Primary School',
  'بغداد, المنصور',
  33.3152,
  44.3661,
  '+9647700000000',
  'علي حسن'
);

-- 2. Create Users in auth.users
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, phone, phone_confirmed_at, raw_user_meta_data)
VALUES
(
  '22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@sayr.local', '$2a$10$wKxNIn8b9s1I8L13fNToO.4eG9gN9kF9K9Tz.k.2J4V/3A1.k/Y0m', now(), '+9647711111111', now(), '{"full_name_ar": "مدير النظام"}'
),
(
  '33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'driver@sayr.local', '$2a$10$wKxNIn8b9s1I8L13fNToO.4eG9gN9kF9K9Tz.k.2J4V/3A1.k/Y0m', now(), '+9647722222222', now(), '{"full_name_ar": "سائق الحافلة"}'
),
(
  '44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'student1@sayr.local', '$2a$10$wKxNIn8b9s1I8L13fNToO.4eG9gN9kF9K9Tz.k.2J4V/3A1.k/Y0m', now(), '+9647733333333', now(), '{"full_name_ar": "طالب أول"}'
),
(
  '55555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'student2@sayr.local', '$2a$10$wKxNIn8b9s1I8L13fNToO.4eG9gN9kF9K9Tz.k.2J4V/3A1.k/Y0m', now(), '+9647744444444', now(), '{"full_name_ar": "طالب ثاني"}'
);

-- Update the public.users table created by the trigger
UPDATE public.users SET role = 'admin' WHERE id = '22222222-2222-2222-2222-222222222222';
UPDATE public.users SET role = 'driver' WHERE id = '33333333-3333-3333-3333-333333333333';
UPDATE public.users SET role = 'student' WHERE id = '44444444-4444-4444-4444-444444444444';
UPDATE public.users SET role = 'student' WHERE id = '55555555-5555-5555-5555-555555555555';

-- Insert into public.admin_users
INSERT INTO public.admin_users (id, admin_level)
VALUES ('22222222-2222-2222-2222-222222222222', 'super_admin');

-- Insert into public.drivers
INSERT INTO public.drivers (id, vehicle_plate_number, vehicle_color_ar, vehicle_capacity, national_id_number, is_approved)
VALUES ('33333333-3333-3333-3333-333333333333', '12345 ب', 'أبيض', 12, '198012345678', true);

-- Insert into public.students
INSERT INTO public.students (id, school_id, parent_phone, parent_name_ar, home_location_address_ar, monthly_subscription_status)
VALUES 
('44444444-4444-4444-4444-444444444444', '123e4567-e89b-12d3-a456-426614174000', '+9647755555555', 'والد الأول', 'بغداد, حي الجامعة', 'active'),
('55555555-5555-5555-5555-555555555555', '123e4567-e89b-12d3-a456-426614174000', '+9647766666666', 'والد الثاني', 'بغداد, حي الخضراء', 'active');

-- Insert into public.routes
INSERT INTO public.routes (id, driver_id, school_id, route_name_ar, status, estimated_pickup_start_time, estimated_arrival_time, route_date)
VALUES ('66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', '123e4567-e89b-12d3-a456-426614174000', 'خط المنصور - الجامعة', 'inactive', '07:00:00', '07:45:00', CURRENT_DATE);

-- Insert into public.route_assignments
INSERT INTO public.route_assignments (route_id, student_id, status)
VALUES 
('66666666-6666-6666-6666-666666666666', '44444444-4444-4444-4444-444444444444', 'pending'),
('66666666-6666-6666-6666-666666666666', '55555555-5555-5555-5555-555555555555', 'pending');
