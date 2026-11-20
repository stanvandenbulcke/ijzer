-- Samen trainen (Stan's idea; SPEC §4.10). Two accounts link with a one-time code; while one
-- trains, the other sees exercise, kg and reps LIVE via a private Realtime channel per pair.
-- Nothing of one account is ever stored in the other's tables: data stays separate (RLS).

create table public.buddy_links (
  user_id uuid not null references auth.users (id) on delete cascade,
  buddy_id uuid not null references auth.users (id) on delete cascade,
  buddy_name text not null default '' check (char_length(buddy_name) <= 60),
  created_at timestamptz not null default now(),
  primary key (user_id, buddy_id),
  check (user_id <> buddy_id)
);
alter table public.buddy_links enable row level security;
alter table public.buddy_links force row level security;
create policy "own rows: select" on public.buddy_links for select to authenticated using (user_id = (select auth.uid()));
revoke all on public.buddy_links from anon, authenticated;
grant select on public.buddy_links to authenticated;

-- One open invite per user, valid 24 hours. Never readable by users directly.
create table public.buddy_invites (
  code text primary key check (code ~ '^[A-Z0-9]{6}$'),
  inviter uuid not null unique references auth.users (id) on delete cascade,
  expires_at timestamptz not null
);
alter table public.buddy_invites enable row level security;
alter table public.buddy_invites force row level security;
revoke all on public.buddy_invites from anon, authenticated;

-- Wrong codes count too: max 20 tries a day against guessing.
create table public.buddy_attempts (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  count int not null default 0,
  primary key (user_id, day)
);
alter table public.buddy_attempts enable row level security;
alter table public.buddy_attempts force row level security;
revoke all on public.buddy_attempts from anon, authenticated;

create function public.pair_topic(a uuid, b uuid) returns text
language sql immutable set search_path = '' as $$
  select 'pair:' || least(a::text, b::text) || ':' || greatest(a::text, b::text)
$$;

create function public.create_buddy_invite() returns text
language plpgsql security definer set search_path = '' as $$
declare
  v_user uuid := auth.uid();
  v_code text;
begin
  if v_user is null then raise exception 'not signed in' using errcode = '42501'; end if;
  delete from public.buddy_invites where inviter = v_user or expires_at < now();
  loop
    -- Letters and digits without look-alikes (0/O, 1/I/L).
    v_code := substr(translate(upper(encode(extensions.gen_random_bytes(12), 'base64')), '+/=0O1IL', ''), 1, 6);
    exit when char_length(v_code) = 6 and not exists (select 1 from public.buddy_invites where code = v_code);
  end loop;
  insert into public.buddy_invites (code, inviter, expires_at) values (v_code, v_user, now() + interval '24 hours');
  return v_code;
end;
$$;

-- Returns {"status": "ok" | "invalid" | "own" | "limit", "name": "..."}. No exceptions on a bad
-- code, so the attempt still counts.
create function public.accept_buddy_invite(p_code text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_user uuid := auth.uid();
  v_code text := upper(trim(coalesce(p_code, '')));
  v_inviter uuid;
  v_attempts int;
  v_my_name text;
  v_their_name text;
begin
  if v_user is null then raise exception 'not signed in' using errcode = '42501'; end if;
  insert into public.buddy_attempts (user_id, day, count) values (v_user, current_date, 1)
    on conflict (user_id, day) do update set count = public.buddy_attempts.count + 1
    returning count into v_attempts;
  if v_attempts > 20 then return jsonb_build_object('status', 'limit'); end if;
  select inviter into v_inviter from public.buddy_invites where code = v_code and expires_at > now();
  if v_inviter is null then return jsonb_build_object('status', 'invalid'); end if;
  if v_inviter = v_user then return jsonb_build_object('status', 'own'); end if;
  delete from public.buddy_invites where code = v_code;
  select left(coalesce(data ->> 'name', ''), 60) into v_my_name from public.profiles where id = v_user;
  select left(coalesce(data ->> 'name', ''), 60) into v_their_name from public.profiles where id = v_inviter;
  insert into public.buddy_links (user_id, buddy_id, buddy_name) values
    (v_user, v_inviter, coalesce(v_their_name, '')),
    (v_inviter, v_user, coalesce(v_my_name, ''))
  on conflict (user_id, buddy_id) do update set buddy_name = excluded.buddy_name;
  return jsonb_build_object('status', 'ok', 'name', coalesce(v_their_name, ''));
end;
$$;

-- Unlinking works from either side and removes both directions.
create function public.remove_buddy(p_buddy uuid) returns void
language sql security definer set search_path = '' as $$
  delete from public.buddy_links
  where (user_id = (select auth.uid()) and buddy_id = p_buddy)
     or (user_id = p_buddy and buddy_id = (select auth.uid()));
$$;

revoke execute on function public.create_buddy_invite(), public.accept_buddy_invite(text),
  public.remove_buddy(uuid), public.pair_topic(uuid, uuid) from public, anon;
grant execute on function public.create_buddy_invite(), public.accept_buddy_invite(text),
  public.remove_buddy(uuid), public.pair_topic(uuid, uuid) to authenticated;

-- Realtime: only the two linked accounts may listen to or send on their pair channel.
create policy "buddies: receive" on realtime.messages for select to authenticated
  using (exists (
    select 1 from public.buddy_links bl
    where bl.user_id = (select auth.uid())
      and (select realtime.topic()) = public.pair_topic(bl.user_id, bl.buddy_id)
  ));
create policy "buddies: send" on realtime.messages for insert to authenticated
  with check (exists (
    select 1 from public.buddy_links bl
    where bl.user_id = (select auth.uid())
      and (select realtime.topic()) = public.pair_topic(bl.user_id, bl.buddy_id)
  ));
