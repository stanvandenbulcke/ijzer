-- Hardening after the data-loss review (2026-11-20).
-- 1. When an older write is refused, still bump server_updated_at, so the device that sent it
--    pulls the newer version instead of silently keeping its stale copy.
create or replace function public.ijzer_touch()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' and new.updated_at < old.updated_at then
    new := old;
  end if;
  new.server_updated_at := clock_timestamp();
  return new;
end;
$$;

-- 2. A size limit per document, so nobody can fill the free database with huge rows.
do $$
declare
  t text;
begin
  foreach t in array array['profiles', 'custom_exercises', 'routines', 'workouts', 'body_weights', 'check_ins'] loop
    execute format('alter table public.%I add constraint %I check (octet_length(data::text) < 262144)', t, t || '_data_size');
  end loop;
end;
$$;
