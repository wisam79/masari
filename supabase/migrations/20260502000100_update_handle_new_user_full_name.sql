create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, full_name, phone, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.phone,
    new.email,
    'unassigned'
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = case
        when excluded.full_name = '' then public.users.full_name
        else excluded.full_name
      end;
  return new;
end;
$$;
