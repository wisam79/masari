create schema if not exists private;

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid()
$$;

create or replace function private.student_belongs_to_institution(
  p_student_id uuid,
  p_institution_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.student_profiles sp
    where sp.user_id = p_student_id
      and sp.institution_id = p_institution_id
  )
$$;

create or replace function private.driver_serves_institution(
  p_driver_id uuid,
  p_institution_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.driver_institutions di
    join public.users u on u.id = di.driver_id
    where di.driver_id = p_driver_id
      and di.institution_id = p_institution_id
      and di.is_active = true
      and u.role = 'driver'
  )
$$;

create or replace function private.can_student_request_driver(
  p_student_id uuid,
  p_driver_id uuid,
  p_institution_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select private.student_belongs_to_institution(p_student_id, p_institution_id)
     and private.driver_serves_institution(p_driver_id, p_institution_id)
$$;

create or replace function private.driver_can_access_student(
  p_driver_id uuid,
  p_student_id uuid,
  p_institution_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select private.driver_serves_institution(p_driver_id, p_institution_id)
     and private.student_belongs_to_institution(p_student_id, p_institution_id)
     and (
       exists (
         select 1
         from public.student_driver_link sdl
         where sdl.driver_id = p_driver_id
           and sdl.student_id = p_student_id
           and sdl.institution_id = p_institution_id
           and sdl.is_active = true
       )
       or exists (
         select 1
         from public.subscriptions s
         where s.driver_id = p_driver_id
           and s.student_id = p_student_id
           and s.institution_id = p_institution_id
           and s.status in ('pending', 'active')
       )
     )
$$;

grant usage on schema private to authenticated;
revoke all on schema private from anon;
revoke all on function private.current_user_role() from public, anon;
revoke all on function private.student_belongs_to_institution(uuid, uuid) from public, anon;
revoke all on function private.driver_serves_institution(uuid, uuid) from public, anon;
revoke all on function private.can_student_request_driver(uuid, uuid, uuid) from public, anon;
revoke all on function private.driver_can_access_student(uuid, uuid, uuid) from public, anon;
grant execute on function private.current_user_role() to authenticated;
grant execute on function private.student_belongs_to_institution(uuid, uuid) to authenticated;
grant execute on function private.driver_serves_institution(uuid, uuid) to authenticated;
grant execute on function private.can_student_request_driver(uuid, uuid, uuid) to authenticated;
grant execute on function private.driver_can_access_student(uuid, uuid, uuid) to authenticated;

drop policy if exists driver_institutions_insert_own on public.driver_institutions;
create policy driver_institutions_insert_own on public.driver_institutions
for insert to authenticated
with check (
  driver_id = auth.uid()
  and private.current_user_role() = 'driver'
);

drop policy if exists student_profiles_insert_own on public.student_profiles;
create policy student_profiles_insert_own on public.student_profiles
for insert to authenticated
with check (
  user_id = auth.uid()
  and private.current_user_role() = 'student'
);

drop policy if exists student_driver_link_insert_student on public.student_driver_link;
create policy student_driver_link_insert_student on public.student_driver_link
for insert to authenticated
with check (
  student_id = auth.uid()
  and private.can_student_request_driver(student_id, driver_id, institution_id)
);

drop policy if exists student_driver_link_update_relevant on public.student_driver_link;
create policy student_driver_link_update_relevant on public.student_driver_link
for update to authenticated
using (student_id = auth.uid() or driver_id = auth.uid())
with check (
  (
    student_id = auth.uid()
    and private.can_student_request_driver(student_id, driver_id, institution_id)
  )
  or (
    driver_id = auth.uid()
    and private.driver_can_access_student(driver_id, student_id, institution_id)
  )
);

drop policy if exists subscriptions_insert_student on public.subscriptions;
create policy subscriptions_insert_student on public.subscriptions
for insert to authenticated
with check (
  student_id = auth.uid()
  and status = 'pending'
  and private.can_student_request_driver(student_id, driver_id, institution_id)
);

drop policy if exists daily_attendance_insert_relevant on public.daily_attendance;
create policy daily_attendance_insert_relevant on public.daily_attendance
for insert to authenticated
with check (
  (
    student_id = auth.uid()
    and private.driver_can_access_student(driver_id, student_id, institution_id)
  )
  or (
    driver_id = auth.uid()
    and private.driver_can_access_student(driver_id, student_id, institution_id)
  )
);

drop policy if exists daily_attendance_update_relevant on public.daily_attendance;
create policy daily_attendance_update_relevant on public.daily_attendance
for update to authenticated
using (student_id = auth.uid() or driver_id = auth.uid())
with check (
  (
    student_id = auth.uid()
    and private.driver_can_access_student(driver_id, student_id, institution_id)
  )
  or (
    driver_id = auth.uid()
    and private.driver_can_access_student(driver_id, student_id, institution_id)
  )
);

create or replace function public.approve_subscription(p_subscription_id uuid)
returns public.subscriptions
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_subscription public.subscriptions;
begin
  update public.subscriptions
  set
    status = 'active',
    start_date = current_date,
    end_date = current_date + 30,
    approved_at = now(),
    rejected_at = null,
    rejection_reason = null,
    updated_at = now()
  where id = p_subscription_id
    and driver_id = auth.uid()
    and status = 'pending'
    and private.driver_serves_institution(auth.uid(), institution_id)
  returning * into v_subscription;

  if v_subscription.id is null then
    raise exception 'Subscription not found or not allowed';
  end if;

  insert into public.student_driver_link (
    student_id,
    driver_id,
    institution_id,
    pickup_lat,
    pickup_lng,
    pickup_address,
    is_active
  )
  select
    v_subscription.student_id,
    v_subscription.driver_id,
    v_subscription.institution_id,
    sp.pickup_lat,
    sp.pickup_lng,
    sp.pickup_address,
    true
  from public.student_profiles sp
  where sp.user_id = v_subscription.student_id
  on conflict (student_id, driver_id, institution_id) do update
    set pickup_lat = excluded.pickup_lat,
        pickup_lng = excluded.pickup_lng,
        pickup_address = excluded.pickup_address,
        is_active = true,
        updated_at = now();

  return v_subscription;
end;
$$;

create or replace function public.reject_subscription(
  p_subscription_id uuid,
  p_reason text default null
)
returns public.subscriptions
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_subscription public.subscriptions;
begin
  update public.subscriptions
  set
    status = 'rejected',
    rejected_at = now(),
    rejection_reason = nullif(trim(coalesce(p_reason, '')), ''),
    updated_at = now()
  where id = p_subscription_id
    and driver_id = auth.uid()
    and status = 'pending'
    and private.driver_serves_institution(auth.uid(), institution_id)
  returning * into v_subscription;

  if v_subscription.id is null then
    raise exception 'Subscription not found or not allowed';
  end if;

  return v_subscription;
end;
$$;

revoke all on function public.approve_subscription(uuid) from public, anon;
revoke all on function public.reject_subscription(uuid, text) from public, anon;
grant execute on function public.approve_subscription(uuid) to authenticated;
grant execute on function public.reject_subscription(uuid, text) to authenticated;

drop function if exists public.current_user_role();
drop function if exists public.student_belongs_to_institution(uuid, uuid);
drop function if exists public.driver_serves_institution(uuid, uuid);
drop function if exists public.can_student_request_driver(uuid, uuid, uuid);
drop function if exists public.driver_can_access_student(uuid, uuid, uuid);
