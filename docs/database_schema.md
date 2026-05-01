# Database Schema - Masari

Last verified with Supabase MCP on 2026-05-01.

## Overview

The database supports a single-codebase Expo app with role-based routing:

- `student`: student app tabs
- `driver`: driver app tabs
- `unassigned`: signed-in user who has not completed role setup

All public tables have RLS enabled.

## Tables

### `users`

Stores the app profile linked to Supabase Auth.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | PK, default `auth.uid()` |
| `full_name` | `text` | required |
| `phone` | `text` | required, unique |
| `role` | `text` | `student`, `driver`, `unassigned` |
| `created_at` | `timestamptz` | default `now()` |
| `updated_at` | `timestamptz` | default `now()` |

### `institutions`

Stores universities/institutions served by drivers.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `name` | `text` | required, trimmed length > 1 |
| `city` | `text` | nullable |
| `address` | `text` | nullable |
| `lat` | `numeric` | nullable, -90 to 90 |
| `lng` | `numeric` | nullable, -180 to 180 |
| `is_active` | `boolean` | default `true` |
| `created_at` | `timestamptz` | default `now()` |
| `updated_at` | `timestamptz` | default `now()` |

Unique index: lower `name` + lower `city`.

Seeded institutions: Baghdad University, Mustansiriyah University, University of Technology, Al-Nahrain University, University of Kufa, University of Basrah, University of Mosul.

### `driver_institutions`

Maps drivers to institutions they serve.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `driver_id` | `uuid` | FK to `users.id` |
| `institution_id` | `uuid` | FK to `institutions.id` |
| `is_active` | `boolean` | default `true` |
| `created_at` | `timestamptz` | default `now()` |
| `updated_at` | `timestamptz` | default `now()` |

Unique constraint: `driver_id`, `institution_id`.

### `student_profiles`

Stores student institution and pickup details.

| Column | Type | Notes |
| --- | --- | --- |
| `user_id` | `uuid` | PK, FK to `users.id` |
| `institution_id` | `uuid` | FK to `institutions.id` |
| `pickup_lat` | `numeric` | required, -90 to 90 |
| `pickup_lng` | `numeric` | required, -180 to 180 |
| `pickup_address` | `text` | nullable |
| `created_at` | `timestamptz` | default `now()` |
| `updated_at` | `timestamptz` | default `now()` |

### `student_driver_link`

Links a student to a driver for one institution and pickup point.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `student_id` | `uuid` | FK to `users.id` |
| `driver_id` | `uuid` | FK to `users.id` |
| `institution_id` | `uuid` | FK to `institutions.id` |
| `pickup_lat` | `numeric` | required, -90 to 90 |
| `pickup_lng` | `numeric` | required, -180 to 180 |
| `pickup_address` | `text` | nullable |
| `is_active` | `boolean` | default `true` |
| `created_at` | `timestamptz` | default `now()` |
| `updated_at` | `timestamptz` | default `now()` |

Unique constraint: `student_id`, `driver_id`, `institution_id`.

### `subscriptions`

Tracks manual billing and driver review.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `student_id` | `uuid` | FK to `users.id` |
| `driver_id` | `uuid` | FK to `users.id` |
| `institution_id` | `uuid` | FK to `institutions.id` |
| `status` | `text` | `pending`, `active`, `expired`, `rejected`; default `pending` |
| `start_date` | `date` | nullable |
| `end_date` | `date` | nullable |
| `receipt_image_url` | `text` | nullable |
| `receipt_image_path` | `text` | nullable, storage object path |
| `payment_method` | `text` | `zaincash`, `fib`, `cash`, `other`; default `other` |
| `payment_reference` | `text` | nullable |
| `amount` | `integer` | default `90000` |
| `approved_at` | `timestamptz` | nullable |
| `rejected_at` | `timestamptz` | nullable |
| `rejection_reason` | `text` | nullable |
| `created_at` | `timestamptz` | default `now()` |
| `updated_at` | `timestamptz` | default `now()` |

Constraint: active subscriptions must have `start_date`, `end_date`, and `approved_at`.

### `daily_attendance`

Tracks whether a student should appear on the route for a date.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `student_id` | `uuid` | FK to `users.id` |
| `driver_id` | `uuid` | FK to `users.id` |
| `institution_id` | `uuid` | FK to `institutions.id` |
| `date` | `date` | required |
| `status` | `text` | `pending`, `present`, `absent`, `driver_waiting`, `in_transit`, `completed` |
| `created_at` | `timestamptz` | default `now()` |
| `updated_at` | `timestamptz` | default `now()` |

Unique constraint: `student_id`, `date`.

### `driver_locations`

Stores the latest known location per driver.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `driver_id` | `uuid` | FK to `users.id`, unique |
| `lat` | `numeric` | required, -90 to 90 |
| `lng` | `numeric` | required, -180 to 180 |
| `last_updated` | `timestamptz` | default `now()` |
| `created_at` | `timestamptz` | default `now()` |

## Storage

Bucket: `receipts`

- Private bucket.
- Max file size: 5 MB.
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`.
- Students upload to their own `{auth.uid()}/...` folder.
- Drivers can read receipt files only when a subscription assigned to them references the object path.

## RPC Functions

- `public.approve_subscription(p_subscription_id uuid)`: activates a pending subscription for the authenticated driver, sets a 30-day window, clears rejection fields, and upserts the active student-driver link from `student_profiles`.
- `public.reject_subscription(p_subscription_id uuid, p_reason text default null)`: rejects a pending subscription for the authenticated driver and stores a cleaned optional reason.

## TypeScript

Generated schema types are stored in `types/Database.ts`. Use `Tables<T>`, `TablesInsert<T>`, and `TablesUpdate<T>` from that file instead of hand-written table interfaces.
