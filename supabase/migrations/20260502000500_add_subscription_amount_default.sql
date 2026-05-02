alter table public.subscriptions
  alter column amount set default 0,
  add constraint subscriptions_amount_positive check (amount > 0);
