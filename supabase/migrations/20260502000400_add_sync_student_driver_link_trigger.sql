create or replace function public.sync_student_driver_link_pickup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and (
    old.pickup_lat is distinct from new.pickup_lat or
    old.pickup_lng is distinct from new.pickup_lng or
    old.pickup_address is distinct from new.pickup_address
  ) then
    update public.student_driver_link
    set pickup_lat = new.pickup_lat,
        pickup_lng = new.pickup_lng,
        pickup_address = new.pickup_address,
        updated_at = now()
    where student_id = new.user_id
      and is_active = true;
  end if;

  return new;
end;
$$;

revoke all on function public.sync_student_driver_link_pickup() from public, anon;
grant execute on function public.sync_student_driver_link_pickup() to authenticated;

drop trigger if exists sync_pickup_on_profile_update on public.student_profiles;
create trigger sync_pickup_on_profile_update
after update on public.student_profiles
for each row execute function public.sync_student_driver_link_pickup();
