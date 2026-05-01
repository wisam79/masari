drop policy if exists users_select_own on public.users;
create policy users_select_own on public.users
for select to authenticated
using (id = (select auth.uid()));

drop policy if exists users_select_drivers_for_student_institution on public.users;
create policy users_select_drivers_for_student_institution on public.users
for select to authenticated
using (
  role = 'driver'
  and exists (
    select 1
    from public.driver_institutions di
    join public.student_profiles sp on sp.institution_id = di.institution_id
    where di.driver_id = users.id
      and di.is_active = true
      and sp.user_id = (select auth.uid())
  )
);

drop policy if exists users_select_students_for_driver_assignments on public.users;
create policy users_select_students_for_driver_assignments on public.users
for select to authenticated
using (
  role = 'student'
  and (
    exists (
      select 1
      from public.student_driver_link sdl
      where sdl.student_id = users.id
        and sdl.driver_id = (select auth.uid())
    )
    or exists (
      select 1
      from public.subscriptions s
      where s.student_id = users.id
        and s.driver_id = (select auth.uid())
    )
  )
);

drop policy if exists users_insert_own on public.users;
create policy users_insert_own on public.users
for insert to authenticated
with check (id = (select auth.uid()));

drop policy if exists users_update_own on public.users;
create policy users_update_own on public.users
for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

drop policy if exists driver_institutions_select_relevant on public.driver_institutions;
create policy driver_institutions_select_relevant on public.driver_institutions
for select to authenticated
using (
  driver_id = (select auth.uid())
  or exists (
    select 1
    from public.student_profiles sp
    where sp.user_id = (select auth.uid())
      and sp.institution_id = driver_institutions.institution_id
  )
);

drop policy if exists driver_institutions_insert_own on public.driver_institutions;
create policy driver_institutions_insert_own on public.driver_institutions
for insert to authenticated
with check (
  driver_id = (select auth.uid())
  and (select private.current_user_role()) = 'driver'
);

drop policy if exists driver_institutions_update_own on public.driver_institutions;
create policy driver_institutions_update_own on public.driver_institutions
for update to authenticated
using (driver_id = (select auth.uid()))
with check (driver_id = (select auth.uid()));

drop policy if exists student_profiles_select_relevant on public.student_profiles;
create policy student_profiles_select_relevant on public.student_profiles
for select to authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1
    from public.student_driver_link sdl
    where sdl.student_id = student_profiles.user_id
      and sdl.driver_id = (select auth.uid())
      and sdl.institution_id = student_profiles.institution_id
  )
  or exists (
    select 1
    from public.subscriptions s
    where s.student_id = student_profiles.user_id
      and s.driver_id = (select auth.uid())
      and s.institution_id = student_profiles.institution_id
  )
);

drop policy if exists student_profiles_insert_own on public.student_profiles;
create policy student_profiles_insert_own on public.student_profiles
for insert to authenticated
with check (
  user_id = (select auth.uid())
  and (select private.current_user_role()) = 'student'
);

drop policy if exists student_profiles_update_own on public.student_profiles;
create policy student_profiles_update_own on public.student_profiles
for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists student_driver_link_select_relevant on public.student_driver_link;
create policy student_driver_link_select_relevant on public.student_driver_link
for select to authenticated
using (student_id = (select auth.uid()) or driver_id = (select auth.uid()));

drop policy if exists student_driver_link_insert_student on public.student_driver_link;
create policy student_driver_link_insert_student on public.student_driver_link
for insert to authenticated
with check (
  student_id = (select auth.uid())
  and private.can_student_request_driver(student_id, driver_id, institution_id)
);

drop policy if exists student_driver_link_update_relevant on public.student_driver_link;
create policy student_driver_link_update_relevant on public.student_driver_link
for update to authenticated
using (student_id = (select auth.uid()) or driver_id = (select auth.uid()))
with check (
  (
    student_id = (select auth.uid())
    and private.can_student_request_driver(student_id, driver_id, institution_id)
  )
  or (
    driver_id = (select auth.uid())
    and private.driver_can_access_student(driver_id, student_id, institution_id)
  )
);

drop policy if exists subscriptions_select_relevant on public.subscriptions;
create policy subscriptions_select_relevant on public.subscriptions
for select to authenticated
using (student_id = (select auth.uid()) or driver_id = (select auth.uid()));

drop policy if exists subscriptions_insert_student on public.subscriptions;
create policy subscriptions_insert_student on public.subscriptions
for insert to authenticated
with check (
  student_id = (select auth.uid())
  and status = 'pending'
  and private.can_student_request_driver(student_id, driver_id, institution_id)
);

drop policy if exists daily_attendance_select_relevant on public.daily_attendance;
create policy daily_attendance_select_relevant on public.daily_attendance
for select to authenticated
using (student_id = (select auth.uid()) or driver_id = (select auth.uid()));

drop policy if exists daily_attendance_insert_relevant on public.daily_attendance;
create policy daily_attendance_insert_relevant on public.daily_attendance
for insert to authenticated
with check (
  (
    student_id = (select auth.uid())
    and private.driver_can_access_student(driver_id, student_id, institution_id)
  )
  or (
    driver_id = (select auth.uid())
    and private.driver_can_access_student(driver_id, student_id, institution_id)
  )
);

drop policy if exists daily_attendance_update_relevant on public.daily_attendance;
create policy daily_attendance_update_relevant on public.daily_attendance
for update to authenticated
using (student_id = (select auth.uid()) or driver_id = (select auth.uid()))
with check (
  (
    student_id = (select auth.uid())
    and private.driver_can_access_student(driver_id, student_id, institution_id)
  )
  or (
    driver_id = (select auth.uid())
    and private.driver_can_access_student(driver_id, student_id, institution_id)
  )
);

drop policy if exists driver_locations_select_relevant on public.driver_locations;
create policy driver_locations_select_relevant on public.driver_locations
for select to authenticated
using (
  driver_id = (select auth.uid())
  or exists (
    select 1
    from public.student_driver_link sdl
    where sdl.driver_id = driver_locations.driver_id
      and sdl.student_id = (select auth.uid())
      and sdl.is_active = true
  )
  or exists (
    select 1
    from public.subscriptions s
    where s.driver_id = driver_locations.driver_id
      and s.student_id = (select auth.uid())
      and s.status = 'active'
  )
);

drop policy if exists driver_locations_insert_own on public.driver_locations;
create policy driver_locations_insert_own on public.driver_locations
for insert to authenticated
with check (driver_id = (select auth.uid()));

drop policy if exists driver_locations_update_own on public.driver_locations;
create policy driver_locations_update_own on public.driver_locations
for update to authenticated
using (driver_id = (select auth.uid()))
with check (driver_id = (select auth.uid()));

drop policy if exists receipts_insert_student_own_folder on storage.objects;
create policy receipts_insert_student_own_folder on storage.objects
for insert to authenticated
with check (
  bucket_id = 'receipts'
  and split_part(name, '/', 1) = (select auth.uid())::text
);

drop policy if exists receipts_select_relevant on storage.objects;
create policy receipts_select_relevant on storage.objects
for select to authenticated
using (
  bucket_id = 'receipts'
  and (
    split_part(name, '/', 1) = (select auth.uid())::text
    or exists (
      select 1
      from public.subscriptions s
      where s.receipt_image_path = storage.objects.name
        and s.driver_id = (select auth.uid())
    )
  )
);
