drop trigger if exists update_daily_attendance_updated_at on public.daily_attendance;
create trigger update_daily_attendance_updated_at
before update on public.daily_attendance
for each row execute function public.update_updated_at_column();
