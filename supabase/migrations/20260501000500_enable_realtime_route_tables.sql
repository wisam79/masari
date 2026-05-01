alter table public.driver_locations replica identity full;
alter table public.daily_attendance replica identity full;

do $$
begin
  if exists (
    select 1
    from pg_publication
    where pubname = 'supabase_realtime'
  ) then
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'driver_locations'
    ) then
      alter publication supabase_realtime add table public.driver_locations;
    end if;

    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'daily_attendance'
    ) then
      alter publication supabase_realtime add table public.daily_attendance;
    end if;
  end if;
end $$;
