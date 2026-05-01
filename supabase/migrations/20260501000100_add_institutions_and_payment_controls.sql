create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  address text,
  lat numeric,
  lng numeric,
  is_active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint institutions_name_not_blank check (length(trim(name)) > 1),
  constraint institutions_lat_range check (lat is null or (lat between -90 and 90)),
  constraint institutions_lng_range check (lng is null or (lng between -180 and 180))
);

create unique index if not exists institutions_name_city_unique
  on public.institutions (lower(name), coalesce(lower(city), ''));

drop trigger if exists update_institutions_updated_at on public.institutions;
create trigger update_institutions_updated_at
before update on public.institutions
for each row execute function public.update_updated_at_column();

create table if not exists public.driver_institutions (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.users(id) on delete cascade,
  institution_id uuid not null references public.institutions(id) on delete cascade,
  is_active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (driver_id, institution_id)
);

create index if not exists idx_driver_institutions_driver_id
  on public.driver_institutions (driver_id);
create index if not exists idx_driver_institutions_institution_id
  on public.driver_institutions (institution_id);
create index if not exists idx_driver_institutions_active
  on public.driver_institutions (is_active);

drop trigger if exists update_driver_institutions_updated_at on public.driver_institutions;
create trigger update_driver_institutions_updated_at
before update on public.driver_institutions
for each row execute function public.update_updated_at_column();

create table if not exists public.student_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  institution_id uuid not null references public.institutions(id) on delete restrict,
  pickup_lat numeric not null,
  pickup_lng numeric not null,
  pickup_address text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint student_profiles_lat_range check (pickup_lat between -90 and 90),
  constraint student_profiles_lng_range check (pickup_lng between -180 and 180)
);

create index if not exists idx_student_profiles_institution_id
  on public.student_profiles (institution_id);

drop trigger if exists update_student_profiles_updated_at on public.student_profiles;
create trigger update_student_profiles_updated_at
before update on public.student_profiles
for each row execute function public.update_updated_at_column();

alter table public.student_driver_link
  add column if not exists institution_id uuid;

alter table public.student_driver_link
  alter column institution_id set not null;

alter table public.student_driver_link
  drop constraint if exists student_driver_link_institution_id_fkey,
  add constraint student_driver_link_institution_id_fkey
    foreign key (institution_id) references public.institutions(id) on delete restrict;

alter table public.student_driver_link
  drop constraint if exists student_driver_link_student_id_driver_id_key;

alter table public.student_driver_link
  add constraint student_driver_link_student_driver_institution_key
    unique (student_id, driver_id, institution_id);

alter table public.student_driver_link
  add constraint student_driver_link_lat_range
    check (pickup_lat between -90 and 90),
  add constraint student_driver_link_lng_range
    check (pickup_lng between -180 and 180);

create index if not exists idx_student_driver_link_institution_id
  on public.student_driver_link (institution_id);

alter table public.subscriptions
  add column if not exists institution_id uuid,
  add column if not exists payment_method text not null default 'other',
  add column if not exists payment_reference text,
  add column if not exists receipt_image_path text,
  add column if not exists approved_at timestamptz,
  add column if not exists rejected_at timestamptz,
  add column if not exists rejection_reason text;

alter table public.subscriptions
  alter column institution_id set not null;

alter table public.subscriptions
  drop constraint if exists subscriptions_institution_id_fkey,
  add constraint subscriptions_institution_id_fkey
    foreign key (institution_id) references public.institutions(id) on delete restrict;

alter table public.subscriptions
  drop constraint if exists subscriptions_payment_method_check,
  add constraint subscriptions_payment_method_check
    check (payment_method in ('zaincash', 'fib', 'cash', 'other')),
  drop constraint if exists subscriptions_active_dates_check,
  add constraint subscriptions_active_dates_check
    check (
      status <> 'active'
      or (start_date is not null and end_date is not null and approved_at is not null)
    );

create index if not exists idx_subscriptions_institution_id
  on public.subscriptions (institution_id);
create index if not exists idx_subscriptions_payment_method
  on public.subscriptions (payment_method);

alter table public.daily_attendance
  add column if not exists institution_id uuid;

alter table public.daily_attendance
  alter column institution_id set not null;

alter table public.daily_attendance
  drop constraint if exists daily_attendance_institution_id_fkey,
  add constraint daily_attendance_institution_id_fkey
    foreign key (institution_id) references public.institutions(id) on delete restrict;

create index if not exists idx_daily_attendance_institution_id
  on public.daily_attendance (institution_id);

alter table public.driver_locations
  drop constraint if exists driver_locations_driver_id_key,
  add constraint driver_locations_driver_id_key unique (driver_id),
  add constraint driver_locations_lat_range check (lat between -90 and 90),
  add constraint driver_locations_lng_range check (lng between -180 and 180);

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid()
$$;

create or replace function public.student_belongs_to_institution(
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

create or replace function public.driver_serves_institution(
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

create or replace function public.can_student_request_driver(
  p_student_id uuid,
  p_driver_id uuid,
  p_institution_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.student_belongs_to_institution(p_student_id, p_institution_id)
     and public.driver_serves_institution(p_driver_id, p_institution_id)
$$;

create or replace function public.driver_can_access_student(
  p_driver_id uuid,
  p_student_id uuid,
  p_institution_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.driver_serves_institution(p_driver_id, p_institution_id)
     and public.student_belongs_to_institution(p_student_id, p_institution_id)
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

create or replace function public.approve_subscription(p_subscription_id uuid)
returns public.subscriptions
language plpgsql
security definer
set search_path = public
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
    and public.driver_serves_institution(auth.uid(), institution_id)
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
set search_path = public
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
    and public.driver_serves_institution(auth.uid(), institution_id)
  returning * into v_subscription;

  if v_subscription.id is null then
    raise exception 'Subscription not found or not allowed';
  end if;

  return v_subscription;
end;
$$;

revoke all on function public.current_user_role() from public;
revoke all on function public.student_belongs_to_institution(uuid, uuid) from public;
revoke all on function public.driver_serves_institution(uuid, uuid) from public;
revoke all on function public.can_student_request_driver(uuid, uuid, uuid) from public;
revoke all on function public.driver_can_access_student(uuid, uuid, uuid) from public;
revoke all on function public.approve_subscription(uuid) from public;
revoke all on function public.reject_subscription(uuid, text) from public;

grant execute on function public.current_user_role() to authenticated;
grant execute on function public.student_belongs_to_institution(uuid, uuid) to authenticated;
grant execute on function public.driver_serves_institution(uuid, uuid) to authenticated;
grant execute on function public.can_student_request_driver(uuid, uuid, uuid) to authenticated;
grant execute on function public.driver_can_access_student(uuid, uuid, uuid) to authenticated;
grant execute on function public.approve_subscription(uuid) to authenticated;
grant execute on function public.reject_subscription(uuid, text) to authenticated;

alter table public.institutions enable row level security;
alter table public.driver_institutions enable row level security;
alter table public.student_profiles enable row level security;
alter table public.users enable row level security;
alter table public.student_driver_link enable row level security;
alter table public.subscriptions enable row level security;
alter table public.daily_attendance enable row level security;
alter table public.driver_locations enable row level security;

drop policy if exists "Users can view own profile" on public.users;
drop policy if exists "Users can update own profile" on public.users;
drop policy if exists "Users can insert own profile" on public.users;
drop policy if exists users_select_own on public.users;
drop policy if exists users_select_drivers_for_student_institution on public.users;
drop policy if exists users_select_students_for_driver_assignments on public.users;
drop policy if exists users_insert_own on public.users;
drop policy if exists users_update_own on public.users;

create policy users_select_own on public.users
for select to authenticated
using (id = auth.uid());

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
      and sp.user_id = auth.uid()
  )
);

create policy users_select_students_for_driver_assignments on public.users
for select to authenticated
using (
  role = 'student'
  and (
    exists (
      select 1
      from public.student_driver_link sdl
      where sdl.student_id = users.id
        and sdl.driver_id = auth.uid()
    )
    or exists (
      select 1
      from public.subscriptions s
      where s.student_id = users.id
        and s.driver_id = auth.uid()
    )
  )
);

create policy users_insert_own on public.users
for insert to authenticated
with check (id = auth.uid());

create policy users_update_own on public.users
for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists institutions_select_active on public.institutions;
create policy institutions_select_active on public.institutions
for select to authenticated
using (is_active = true);

drop policy if exists driver_institutions_select_relevant on public.driver_institutions;
drop policy if exists driver_institutions_insert_own on public.driver_institutions;
drop policy if exists driver_institutions_update_own on public.driver_institutions;

create policy driver_institutions_select_relevant on public.driver_institutions
for select to authenticated
using (
  driver_id = auth.uid()
  or exists (
    select 1
    from public.student_profiles sp
    where sp.user_id = auth.uid()
      and sp.institution_id = driver_institutions.institution_id
  )
);

create policy driver_institutions_insert_own on public.driver_institutions
for insert to authenticated
with check (
  driver_id = auth.uid()
  and public.current_user_role() = 'driver'
);

create policy driver_institutions_update_own on public.driver_institutions
for update to authenticated
using (driver_id = auth.uid())
with check (driver_id = auth.uid());

drop policy if exists student_profiles_select_relevant on public.student_profiles;
drop policy if exists student_profiles_insert_own on public.student_profiles;
drop policy if exists student_profiles_update_own on public.student_profiles;

create policy student_profiles_select_relevant on public.student_profiles
for select to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.student_driver_link sdl
    where sdl.student_id = student_profiles.user_id
      and sdl.driver_id = auth.uid()
      and sdl.institution_id = student_profiles.institution_id
  )
  or exists (
    select 1
    from public.subscriptions s
    where s.student_id = student_profiles.user_id
      and s.driver_id = auth.uid()
      and s.institution_id = student_profiles.institution_id
  )
);

create policy student_profiles_insert_own on public.student_profiles
for insert to authenticated
with check (
  user_id = auth.uid()
  and public.current_user_role() = 'student'
);

create policy student_profiles_update_own on public.student_profiles
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Students can view own links" on public.student_driver_link;
drop policy if exists "Drivers can view student links" on public.student_driver_link;
drop policy if exists "Students can update own links" on public.student_driver_link;
drop policy if exists "Drivers can update student links" on public.student_driver_link;
drop policy if exists student_driver_link_select_relevant on public.student_driver_link;
drop policy if exists student_driver_link_insert_student on public.student_driver_link;
drop policy if exists student_driver_link_update_relevant on public.student_driver_link;

create policy student_driver_link_select_relevant on public.student_driver_link
for select to authenticated
using (student_id = auth.uid() or driver_id = auth.uid());

create policy student_driver_link_insert_student on public.student_driver_link
for insert to authenticated
with check (
  student_id = auth.uid()
  and public.can_student_request_driver(student_id, driver_id, institution_id)
);

create policy student_driver_link_update_relevant on public.student_driver_link
for update to authenticated
using (student_id = auth.uid() or driver_id = auth.uid())
with check (
  (
    student_id = auth.uid()
    and public.can_student_request_driver(student_id, driver_id, institution_id)
  )
  or (
    driver_id = auth.uid()
    and public.driver_can_access_student(driver_id, student_id, institution_id)
  )
);

drop policy if exists "Students can view own subscriptions" on public.subscriptions;
drop policy if exists "Drivers can view student subscriptions" on public.subscriptions;
drop policy if exists "Students can insert own subscriptions" on public.subscriptions;
drop policy if exists "Drivers can update student subscriptions" on public.subscriptions;
drop policy if exists subscriptions_select_relevant on public.subscriptions;
drop policy if exists subscriptions_insert_student on public.subscriptions;

create policy subscriptions_select_relevant on public.subscriptions
for select to authenticated
using (student_id = auth.uid() or driver_id = auth.uid());

create policy subscriptions_insert_student on public.subscriptions
for insert to authenticated
with check (
  student_id = auth.uid()
  and status = 'pending'
  and public.can_student_request_driver(student_id, driver_id, institution_id)
);

drop policy if exists "Students can view own attendance" on public.daily_attendance;
drop policy if exists "Drivers can view student attendance" on public.daily_attendance;
drop policy if exists "Students can insert own attendance" on public.daily_attendance;
drop policy if exists "Students can update own attendance" on public.daily_attendance;
drop policy if exists "Drivers can update student attendance" on public.daily_attendance;
drop policy if exists daily_attendance_select_relevant on public.daily_attendance;
drop policy if exists daily_attendance_insert_relevant on public.daily_attendance;
drop policy if exists daily_attendance_update_relevant on public.daily_attendance;

create policy daily_attendance_select_relevant on public.daily_attendance
for select to authenticated
using (student_id = auth.uid() or driver_id = auth.uid());

create policy daily_attendance_insert_relevant on public.daily_attendance
for insert to authenticated
with check (
  (
    student_id = auth.uid()
    and public.driver_can_access_student(driver_id, student_id, institution_id)
  )
  or (
    driver_id = auth.uid()
    and public.driver_can_access_student(driver_id, student_id, institution_id)
  )
);

create policy daily_attendance_update_relevant on public.daily_attendance
for update to authenticated
using (student_id = auth.uid() or driver_id = auth.uid())
with check (
  (
    student_id = auth.uid()
    and public.driver_can_access_student(driver_id, student_id, institution_id)
  )
  or (
    driver_id = auth.uid()
    and public.driver_can_access_student(driver_id, student_id, institution_id)
  )
);

drop policy if exists "Drivers can view own locations" on public.driver_locations;
drop policy if exists "Drivers can insert own locations" on public.driver_locations;
drop policy if exists "Drivers can update own locations" on public.driver_locations;
drop policy if exists driver_locations_select_relevant on public.driver_locations;
drop policy if exists driver_locations_insert_own on public.driver_locations;
drop policy if exists driver_locations_update_own on public.driver_locations;

create policy driver_locations_select_relevant on public.driver_locations
for select to authenticated
using (
  driver_id = auth.uid()
  or exists (
    select 1
    from public.student_driver_link sdl
    where sdl.driver_id = driver_locations.driver_id
      and sdl.student_id = auth.uid()
      and sdl.is_active = true
  )
  or exists (
    select 1
    from public.subscriptions s
    where s.driver_id = driver_locations.driver_id
      and s.student_id = auth.uid()
      and s.status = 'active'
  )
);

create policy driver_locations_insert_own on public.driver_locations
for insert to authenticated
with check (driver_id = auth.uid());

create policy driver_locations_update_own on public.driver_locations
for update to authenticated
using (driver_id = auth.uid())
with check (driver_id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'receipts',
  'receipts',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists receipts_insert_student_own_folder on storage.objects;
drop policy if exists receipts_select_relevant on storage.objects;

create policy receipts_insert_student_own_folder on storage.objects
for insert to authenticated
with check (
  bucket_id = 'receipts'
  and split_part(name, '/', 1) = auth.uid()::text
);

create policy receipts_select_relevant on storage.objects
for select to authenticated
using (
  bucket_id = 'receipts'
  and (
    split_part(name, '/', 1) = auth.uid()::text
    or exists (
      select 1
      from public.subscriptions s
      where s.receipt_image_path = storage.objects.name
        and s.driver_id = auth.uid()
    )
  )
);
