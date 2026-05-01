-- Make phone optional since we are switching to email
alter table public.users alter column phone drop not null;

-- Add email column to track the user's email locally
alter table public.users add column if not exists email text unique;

-- Update the trigger to handle email
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, phone, email, role)
  values (new.id, new.phone, new.email, 'unassigned')
  on conflict (id) do update
  set email = excluded.email;
  return new;
end;
$$;