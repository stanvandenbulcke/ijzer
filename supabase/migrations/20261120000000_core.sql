-- IJZER core schema (SPEC §7). Local-first documents (ADR-012): each row holds one document
-- in `data`; the client decides conflicts with last-write-wins on `updated_at`.
-- RLS is ON for every table: a user only ever sees and changes their own rows (SPEC §7.3).

-- Bumps server_updated_at on every write, and refuses to overwrite a newer row with an
-- older one (last-write-wins on the client's updated_at). `server_updated_at` is the pull
-- cursor: it comes from the server clock, so a phone with a wrong clock cannot miss rows.
create or replace function public.ijzer_touch()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' and new.updated_at < old.updated_at then
    return old;
  end if;
  new.server_updated_at := now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz,
  server_updated_at timestamptz not null default now()
);

create table public.custom_exercises (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz,
  server_updated_at timestamptz not null default now()
);

create table public.routines (like public.custom_exercises including all);
create table public.workouts (like public.custom_exercises including all);
create table public.body_weights (like public.custom_exercises including all);

-- `like … including all` copies defaults and constraints but not foreign keys.
alter table public.routines add foreign key (user_id) references auth.users (id) on delete cascade;
alter table public.workouts add foreign key (user_id) references auth.users (id) on delete cascade;
alter table public.body_weights add foreign key (user_id) references auth.users (id) on delete cascade;

do $$
declare
  t text;
begin
  foreach t in array array['profiles', 'custom_exercises', 'routines', 'workouts', 'body_weights'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('alter table public.%I force row level security', t);
    execute format(
      'create trigger %I before insert or update on public.%I for each row execute function public.ijzer_touch()',
      t || '_touch', t);
    execute format('create index %I on public.%I (server_updated_at)', t || '_server_updated_at_idx', t);
  end loop;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array['custom_exercises', 'routines', 'workouts', 'body_weights'] loop
    execute format('create index %I on public.%I (user_id, server_updated_at)', t || '_user_cursor_idx', t);
    execute format($p$create policy "own rows: select" on public.%I for select to authenticated using (user_id = (select auth.uid()))$p$, t);
    execute format($p$create policy "own rows: insert" on public.%I for insert to authenticated with check (user_id = (select auth.uid()))$p$, t);
    execute format($p$create policy "own rows: update" on public.%I for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))$p$, t);
    execute format($p$create policy "own rows: delete" on public.%I for delete to authenticated using (user_id = (select auth.uid()))$p$, t);
  end loop;
end;
$$;

create policy "own profile: select" on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "own profile: insert" on public.profiles for insert to authenticated with check (id = (select auth.uid()));
create policy "own profile: update" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "own profile: delete" on public.profiles for delete to authenticated using (id = (select auth.uid()));

-- Anonymous visitors get nothing at all.
revoke all on public.profiles, public.custom_exercises, public.routines, public.workouts, public.body_weights from anon;
