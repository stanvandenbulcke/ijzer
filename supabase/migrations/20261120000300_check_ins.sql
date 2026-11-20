-- Daily energy/sleep check-in (Stan's idea #6), same document shape and rules as the others.
create table public.check_ins (like public.custom_exercises including all);
alter table public.check_ins add foreign key (user_id) references auth.users (id) on delete cascade;
alter table public.check_ins enable row level security;
alter table public.check_ins force row level security;
create trigger check_ins_touch before insert or update on public.check_ins
  for each row execute function public.ijzer_touch();
create index check_ins_user_cursor_idx on public.check_ins (user_id, server_updated_at);
create policy "own rows: select" on public.check_ins for select to authenticated using (user_id = (select auth.uid()));
create policy "own rows: insert" on public.check_ins for insert to authenticated with check (user_id = (select auth.uid()));
create policy "own rows: update" on public.check_ins for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own rows: delete" on public.check_ins for delete to authenticated using (user_id = (select auth.uid()));
revoke all on public.check_ins from anon;
grant select, insert, update, delete on public.check_ins to authenticated;
