# Step 1: Database Initialization & MCP Verification - Complete

Last verified with Supabase MCP on 2026-05-01.

## Supabase Project

- Project name: `masari`
- Project ID: `ncffmgqqyxvggqhlhgmz`
- Region: `ap-northeast-1`
- Database: PostgreSQL 17

## Applied Migrations

Verified via MCP:

| Version | Name |
| --- | --- |
| 20260430214830 | create_users_table |
| 20260430214856 | create_subscriptions_table |
| 20260430214939 | create_daily_attendance_table |
| 20260430215134 | create_student_driver_link_table |
| 20260430215215 | create_driver_locations_table |
| 20260501103205 | add_institutions_and_payment_controls |
| 20260501103323 | harden_database_functions |
| 20260501104107 | seed_initial_institutions |
| 20260501112638 | optimize_rls_auth_initplan |

Local migration files are kept under `supabase/migrations/`, including the latest RLS optimization:

- `20260501000100_add_institutions_and_payment_controls.sql`
- `20260501000200_harden_database_functions.sql`
- `20260501000300_seed_initial_institutions.sql`
- `20260501000400_optimize_rls_auth_initplan.sql`

## Tables

All public tables were verified with MCP and have RLS enabled:

- `users`
- `institutions`
- `driver_institutions`
- `student_profiles`
- `student_driver_link`
- `subscriptions`
- `daily_attendance`
- `driver_locations`

## Storage

The private `receipts` bucket exists and was verified with MCP:

- `public`: `false`
- `file_size_limit`: `5242880`
- `allowed_mime_types`: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`

Storage RLS policies:

- `receipts_insert_student_own_folder`: authenticated users can upload only under their own `{user_id}/...` folder.
- `receipts_select_relevant`: students can read their own receipts; drivers can read receipts linked to subscriptions assigned to them.

## Database Functions

Private helper functions live in the `private` schema:

- `private.current_user_role()`
- `private.student_belongs_to_institution(student_id, institution_id)`
- `private.driver_serves_institution(driver_id, institution_id)`
- `private.can_student_request_driver(student_id, driver_id, institution_id)`
- `private.driver_can_access_student(driver_id, student_id, institution_id)`

Public RPC functions:

- `public.approve_subscription(subscription_id)`: driver-only approval, activates subscription for 30 days and creates/updates the active student-driver link.
- `public.reject_subscription(subscription_id, reason)`: driver-only rejection with optional reason.

Both public RPC functions are intentionally `SECURITY DEFINER` and include `driver_id = auth.uid()` plus institution checks.

## RLS Verification

MCP verified active policies for:

- user self-profile access
- driver discovery by student institution
- student discovery by driver assignments
- institution-scoped driver/student profile access
- student-created pending subscriptions only
- driver approval/rejection through RPC only
- attendance visibility and updates for linked students/drivers
- driver location visibility for the driver and assigned/active students
- private receipt upload/read access

The latest migration wraps `auth.uid()` calls as `(select auth.uid())` in RLS policies to avoid per-row init plan overhead.

## TypeScript Types

`types/Database.ts` was generated from Supabase MCP and matches the current database schema. It includes:

- `Database`
- `Tables<T>`
- `TablesInsert<T>`
- `TablesUpdate<T>`
- `Enums<T>`
- `CompositeTypes<T>`

No hand-written table interfaces are required.

## Advisor Status

Security advisor:

- Warns that `public.approve_subscription` and `public.reject_subscription` are authenticated `SECURITY DEFINER` RPC functions. This is intentional for the MVP because normal table updates are not exposed directly; each RPC checks the authenticated driver and institution relationship before changing subscription state.

Performance advisor:

- `auth_rls_initplan` warnings were resolved by `optimize_rls_auth_initplan`.
- Remaining `unused_index` items are expected on a newly seeded database with no real query traffic.
- One remaining `multiple_permissive_policies` warning exists for `users` SELECT policies. It is acceptable for now because the policies separate self, driver discovery, and driver assignment reads clearly; it can be consolidated later if profiling shows pressure.

## Step 1 Result

Step 1 is complete and verified through MCP. The project is ready for Step 2 only when requested.
