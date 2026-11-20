-- RLS tests for Samen trainen: linking only with a valid one-time code, links visible only to
-- their owner, invites never readable, guessing limited, unlinking removes both sides.
-- Runs in one rolled-back transaction. Usage: node scripts/run-sql.mjs supabase/tests/buddies.sql dev
begin;

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
values
  ('a0000000-0000-4000-8000-00000000000a', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rls-a@ijzer.test', '', now(), now(), now(), '{}', '{}'),
  ('b0000000-0000-4000-8000-00000000000b', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rls-b@ijzer.test', '', now(), now(), now(), '{}', '{}'),
  ('c0000000-0000-4000-8000-00000000000c', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rls-c@ijzer.test', '', now(), now(), now(), '{}', '{}');

set local role authenticated;

-- A: a profile name and an invite code.
select set_config('request.jwt.claims', '{"sub":"a0000000-0000-4000-8000-00000000000a","role":"authenticated"}', true);
insert into public.profiles (data, created_at, updated_at) values ('{"name":"Stan"}', now(), now());
select set_config('test.code', public.create_buddy_invite(), true);
do $$
begin
  if current_setting('test.code') !~ '^[A-Z0-9]{6}$' then raise exception 'FAIL: bad invite code'; end if;
  if public.accept_buddy_invite(current_setting('test.code')) ->> 'status' <> 'own' then
    raise exception 'FAIL: A could link with its own code';
  end if;
  begin
    insert into public.buddy_links (user_id, buddy_id) values ('a0000000-0000-4000-8000-00000000000a', 'c0000000-0000-4000-8000-00000000000c');
    raise exception 'FAIL: a user can create a link directly';
  exception when insufficient_privilege then null;
  end;
end;
$$;

-- B: cannot read invites, a wrong code fails, the right one links both ways.
select set_config('request.jwt.claims', '{"sub":"b0000000-0000-4000-8000-00000000000b","role":"authenticated"}', true);
insert into public.profiles (data, created_at, updated_at) values ('{"name":"Lotte"}', now(), now());
do $$
declare r jsonb;
begin
  begin
    perform count(*) from public.buddy_invites;
    raise exception 'FAIL: invites are readable';
  exception when insufficient_privilege then null;
  end;
  if public.accept_buddy_invite('ZZZZZZ') ->> 'status' <> 'invalid' then raise exception 'FAIL: wrong code accepted'; end if;
  r := public.accept_buddy_invite(lower(current_setting('test.code')));
  if r ->> 'status' <> 'ok' or r ->> 'name' <> 'Stan' then raise exception 'FAIL: valid code refused: %', r; end if;
  if (select count(*) from public.buddy_links) <> 1 then raise exception 'FAIL: B should see exactly its own link'; end if;
  if public.accept_buddy_invite(current_setting('test.code')) ->> 'status' <> 'invalid' then
    raise exception 'FAIL: an invite code works twice';
  end if;
end;
$$;

-- C: sees no links of A and B, and guessing stops after 20 tries.
select set_config('request.jwt.claims', '{"sub":"c0000000-0000-4000-8000-00000000000c","role":"authenticated"}', true);
do $$
declare i int;
begin
  if (select count(*) from public.buddy_links) <> 0 then raise exception 'FAIL: C sees links of others'; end if;
  for i in 1..20 loop perform public.accept_buddy_invite('AAAAAA'); end loop;
  if public.accept_buddy_invite('AAAAAA') ->> 'status' <> 'limit' then raise exception 'FAIL: no guessing limit'; end if;
  perform public.remove_buddy('a0000000-0000-4000-8000-00000000000a');
end;
$$;

-- A still linked (C could not unlink them); B unlinks and both sides are gone.
select set_config('request.jwt.claims', '{"sub":"a0000000-0000-4000-8000-00000000000a","role":"authenticated"}', true);
do $$
begin
  if (select count(*) from public.buddy_links) <> 1 then raise exception 'FAIL: link missing for A'; end if;
end;
$$;
select set_config('request.jwt.claims', '{"sub":"b0000000-0000-4000-8000-00000000000b","role":"authenticated"}', true);
select public.remove_buddy('a0000000-0000-4000-8000-00000000000a');
reset role;
do $$
begin
  if (select count(*) from public.buddy_links) <> 0 then raise exception 'FAIL: unlinking left a row'; end if;
end;
$$;

-- Anonymous visitors cannot call anything.
set local role anon;
do $$
begin
  begin
    perform public.create_buddy_invite();
    raise exception 'FAIL: anon can create an invite';
  exception when insufficient_privilege then null;
  end;
end;
$$;

reset role;
select 'ALL BUDDY TESTS PASSED' as result;
rollback;
