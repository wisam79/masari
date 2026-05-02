create or replace function public.get_current_date()
returns date
language sql
stable
security definer
set search_path = public
as $$
  select current_date;
$$;

revoke all on function public.get_current_date() from public, anon;
grant execute on function public.get_current_date() to authenticated;
