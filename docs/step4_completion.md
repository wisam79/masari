# Step 4: Location Polling & Realtime Maps - In Progress

Last updated on 2026-05-01.

## Implemented in App Code

- Driver route screen:
  - Sends driver location automatically while the route screen is open.
  - Uses normal polling every 5 minutes.
  - Switches to fast polling every 1 minute when the driver is within 500 meters of a pickup point.
  - Displays pickup markers and the driver's current marker on the route map.
  - Lets the driver update student route status: waiting, in transit, completed.

- Student attendance screen:
  - Lets the student mark themselves absent for today.
  - Lets the student mark themselves present again if plans change.
  - Displays the driver's latest location and the student's pickup point on a map.

- Realtime hooks:
  - `driver_locations` changes update the map cache through Supabase Realtime.
  - `daily_attendance` changes update student and driver attendance state through Supabase Realtime.

## Added Migration

`supabase/migrations/20260501000500_enable_realtime_route_tables.sql`

This migration enables full replica identity and adds these tables to `supabase_realtime`:

- `public.driver_locations`
- `public.daily_attendance`

## Verification

- `npm run typecheck`
- `npm run lint`

## MCP Status

Supabase MCP is currently returning `Unauthorized`. The migration has been added locally but has not been applied or verified through MCP in this continuation. Apply and verify it after restoring `SUPABASE_ACCESS_TOKEN`.
