-- RLS tests (SPEC §7.3): user B can never read, change, delete or create rows of user A,
-- anonymous visitors get nothing, and an older write never overwrites a newer one.
-- Runs in one transaction that is rolled back: nothing stays behind.
-- Usage: npm run test:rls   (via the Supabase Management API, see scripts/run-sql.mjs)
begin;

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
values
  ('a0000000-0000-4000-8000-00000000000a', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rls-a@ijzer.test', '', now(), now(), now(), '{}', '{}'),
  ('b0000000-0000-4000-8000-00000000000b', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rls-b@ijzer.test', '', now(), now(), now(), '{}', '{}');

-- As user A: create one row in every table.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"a0000000-0000-4000-8000-00000000000a","role":"authenticated"}', true);
insert into public.profiles (data, created_at, updated_at) values ('{"name":"A"}', now(), now());
insert into public.custom_exercises (id, data, created_at, updated_at) values ('a1000000-0000-4000-8000-000000000001', '{}', now(), now());
insert into public.routines (id, data, created_at, updated_at) values ('a2000000-0000-4000-8000-000000000002', '{}', now(), now());
insert into public.workouts (id, data, created_at, updated_at) values ('a3000000-0000-4000-8000-000000000003', '{"name":"A"}', now(), now());
insert into public.body_weights (id, data, created_at, updated_at) values ('a4000000-0000-4000-8000-000000000004', '{}', now(), now());

do $$
declare n int;
begin
  -- A sees its own rows, and user_id was filled in by the server.
  select count(*) into n from public.workouts where user_id = 'a0000000-0000-4000-8000-00000000000a';
  if n <> 1 then raise exception 'FAIL: A cannot see its own workout'; end if;

  -- Last-write-wins: an older write does not overwrite.
  update public.workouts set data = '{"name":"old"}', updated_at = now() - interval '1 day'
    where id = 'a3000000-0000-4000-8000-000000000003';
  if (select data->>'name' from public.workouts where id = 'a3000000-0000-4000-8000-000000000003') <> 'A' then
    raise exception 'FAIL: an older write overwrote a newer row';
  end if;
end;
$$;

-- As user B: see nothing, change nothing.
select set_config('request.jwt.claims', '{"sub":"b0000000-0000-4000-8000-00000000000b","role":"authenticated"}', true);
do $$
declare
  n int;
  t text;
begin
  foreach t in array array['profiles', 'custom_exercises', 'routines', 'workouts', 'body_weights'] loop
    execute format('select count(*) from public.%I', t) into n;
    if n <> 0 then raise exception 'FAIL: B can read % of A', t; end if;
  end loop;

  update public.workouts set data = '{"hacked":true}' where id = 'a3000000-0000-4000-8000-000000000003';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL: B can update a workout of A'; end if;

  delete from public.routines where id = 'a2000000-0000-4000-8000-000000000002';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL: B can delete a routine of A'; end if;

  update public.profiles set data = '{}' where id = 'a0000000-0000-4000-8000-00000000000a';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL: B can update the profile of A'; end if;

  begin
    insert into public.workouts (id, user_id, data, created_at, updated_at)
      values ('b3000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-00000000000a', '{}', now(), now());
    raise exception 'FAIL: B can create a workout in the name of A';
  exception when insufficient_privilege then null;
  end;

  begin
    update public.workouts set user_id = 'a0000000-0000-4000-8000-00000000000a' where user_id = (select auth.uid());
  exception when insufficient_privilege then null;
  end;
end;
$$;

-- Anonymous visitors: no access at all.
set local role anon;
do $$
begin
  begin
    perform count(*) from public.workouts;
    raise exception 'FAIL: anon can query workouts';
  exception when insufficient_privilege then null;
  end;
end;
$$;

reset role;
select 'ALL RLS TESTS PASSED' as result;
rollback;
