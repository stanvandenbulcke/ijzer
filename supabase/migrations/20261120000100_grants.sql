-- Newer Supabase projects do not grant table access to API roles by default. Signed-in users
-- get exactly the four data operations; RLS (previous migration) limits them to their own rows.
grant select, insert, update, delete
  on public.profiles, public.custom_exercises, public.routines, public.workouts, public.body_weights
  to authenticated;
