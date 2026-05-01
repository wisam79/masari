insert into public.institutions (name, city, address, is_active)
values
  ('جامعة بغداد', 'بغداد', 'الجادرية', true),
  ('الجامعة المستنصرية', 'بغداد', 'باب المعظم', true),
  ('الجامعة التكنولوجية', 'بغداد', 'الصناعة', true),
  ('جامعة النهرين', 'بغداد', 'الجادرية', true),
  ('جامعة الكوفة', 'النجف', null, true),
  ('جامعة البصرة', 'البصرة', null, true),
  ('جامعة الموصل', 'الموصل', null, true)
on conflict (lower(name), coalesce(lower(city), '')) do update
set address = excluded.address,
    is_active = true,
    updated_at = now();
