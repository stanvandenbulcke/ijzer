-- Nutrition (SPEC §4.5): own products, logged items and per-day status ("dag volledig gelogd").
-- Same document shape and rules as every other table: RLS forced, own rows only, newest edit
-- wins, 256 KB row limit (copied from custom_exercises with `including all`).
do $$
declare t text;
begin
  foreach t in array array['foods', 'food_logs', 'nutrition_days'] loop
    execute format('create table public.%I (like public.custom_exercises including all)', t);
    execute format('alter table public.%I add foreign key (user_id) references auth.users (id) on delete cascade', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('alter table public.%I force row level security', t);
    execute format('create trigger %I before insert or update on public.%I for each row execute function public.ijzer_touch()', t || '_touch', t);
    execute format('create index %I on public.%I (user_id, server_updated_at)', t || '_user_cursor_idx', t);
    execute format('create policy "own rows: select" on public.%I for select to authenticated using (user_id = (select auth.uid()))', t);
    execute format('create policy "own rows: insert" on public.%I for insert to authenticated with check (user_id = (select auth.uid()))', t);
    execute format('create policy "own rows: update" on public.%I for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t);
    execute format('create policy "own rows: delete" on public.%I for delete to authenticated using (user_id = (select auth.uid()))', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;
