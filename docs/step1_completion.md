# Step 1: Database Initialization & MCP Verification - ✅ Complete

Last verified with Supabase MCP on 2026-05-01.

## Supabase Project

- Project name: `masari`
- Project ID: `ncffmgqqyxvggqhlhgmz`
- Region: `ap-northeast-1`
- Database: PostgreSQL 17

## Applied Migrations (12 total)

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
| 20260501120349 | 20260501000600_add_user_trigger |
| 20260501121206 | 20260501000700_update_users_for_email_auth |
| 20260501154629 | 20260501000500_enable_realtime_route_tables |

## Tables

All public tables verified with MCP and have RLS enabled:

- `users` - User accounts (students, drivers)
- `institutions` - Universities/institutions (7 seeded)
- `driver_institutions` - Driver-institution relationships
- `student_profiles` - Student pickup locations
- `student_driver_link` - Student-driver assignments
- `subscriptions` - Monthly subscriptions
- `daily_attendance` - Daily attendance tracking
- `driver_locations` - Realtime driver location tracking

## Storage

The private `receipts` bucket exists and was verified with MCP:

- `public`: `false`
- `file_size_limit`: `5242880` (5MB)
- `allowed_mime_types`: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`

Storage RLS policies:
- `receipts_insert_student_own_folder`: authenticated users can upload only under their own `{user_id}/...` folder
- `receipts_select_relevant`: students can read their own receipts; drivers can read receipts linked to subscriptions assigned to them

## Database Functions

Private helper functions in `private` schema:
- `private.current_user_role()`
- `private.student_belongs_to_institution(student_id, institution_id)`
- `private.driver_serves_institution(driver_id, institution_id)`
- `private.can_student_request_driver(student_id, driver_id, institution_id)`
- `private.driver_can_access_student(driver_id, student_id, institution_id)`

Public RPC functions:
- `public.approve_subscription(subscription_id)`: driver-only approval, activates subscription for 30 days
- `public.reject_subscription(subscription_id, reason)`: driver-only rejection with optional reason

Both public RPC functions are `SECURITY DEFINER` and include `driver_id = auth.uid()` plus institution checks.

## RLS Verification

MCP verified active policies for:
- User self-profile access
- Driver discovery by student institution
- Student discovery by driver assignments
- Institution-scoped driver/student profile access
- Student-created pending subscriptions only
- Driver approval/rejection through RPC only
- Attendance visibility and updates for linked students/drivers
- Driver location visibility for the driver and assigned/active students
- Private receipt upload/read access

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
- `auth_rls_initplan` warnings were resolved by `optimize_rls_auth_initplan`
- Remaining `unused_index` items are expected on a newly seeded database with no real query traffic
- One remaining `multiple_permissive_policies` warning exists for `users` SELECT policies. It is acceptable for now because the policies separate self, driver discovery, and driver assignment reads clearly

## Step 1 Result

Step 1 is complete and verified through MCP. The project is ready for Step 2.
