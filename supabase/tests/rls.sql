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
insert into public.check_ins (id, data, created_at, updated_at) values ('a5000000-0000-4000-8000-000000000005', '{}', now(), now());
insert into public.foods (id, data, created_at, updated_at) values ('a6000000-0000-4000-8000-000000000006', '{}', now(), now());
insert into public.food_logs (id, data, created_at, updated_at) values ('a7000000-0000-4000-8000-000000000007', '{}', now(), now());
insert into public.nutrition_days (id, data, created_at, updated_at) values ('a8000000-0000-4000-8000-000000000008', '{}', now(), now());

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
  foreach t in array array['profiles', 'custom_exercises', 'routines', 'workouts', 'body_weights', 'check_ins', 'foods', 'food_logs', 'nutrition_days'] loop
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

  -- The client's real operation is an upsert: B upserting onto A's id must not overwrite it.
  begin
    insert into public.workouts (id, user_id, data, created_at, updated_at)
      values ('a3000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-00000000000b', '{"hacked":true}', now(), now() + interval '1 day')
      on conflict (id) do update set data = excluded.data, updated_at = excluded.updated_at;
    raise exception 'FAIL: B can upsert onto a workout of A';
  exception when insufficient_privilege or unique_violation then null;
  end;

  -- B owns a row and tries to hand it to A.
  insert into public.routines (id, data, created_at, updated_at) values ('b2000000-0000-4000-8000-000000000002', '{}', now(), now());
  begin
    update public.routines set user_id = 'a0000000-0000-4000-8000-00000000000a' where id = 'b2000000-0000-4000-8000-000000000002';
    raise exception 'FAIL: B can move a row to A';
  exception when insufficient_privilege then null;
  end;
end;
$$;

do $$
begin
  begin
    insert into public.body_weights (id, data, created_at, updated_at)
      values ('b4000000-0000-4000-8000-000000000004', jsonb_build_object('x', repeat('a', 300000)), now(), now());
    raise exception 'FAIL: a document larger than 256 kB was accepted';
  exception when check_violation then null;
  end;
end;
$$;

-- Barcode cache and usage counter: readable as documented, never writable by users.
do $$
begin
  perform count(*) from public.product_cache;
  begin
    insert into public.product_cache (barcode, data) values ('12345678', '{}');
    raise exception 'FAIL: a user can write the shared product cache';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.bump_lookup_usage('b0000000-0000-4000-8000-00000000000b', current_date);
    raise exception 'FAIL: a user can call bump_lookup_usage';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.lookup_usage (user_id, day, count) values ('b0000000-0000-4000-8000-00000000000b', current_date, 0);
    raise exception 'FAIL: a user can write lookup_usage';
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
  begin
    perform count(*) from public.product_cache;
    raise exception 'FAIL: anon can read the product cache';
  exception when insufficient_privilege then null;
  end;
end;
$$;

reset role;
select 'ALL RLS TESTS PASSED' as result;
rollback;
