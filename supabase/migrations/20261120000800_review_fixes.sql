-- Fixes from the security review of barcodes and Samen trainen (2026-11-20).

-- M1: the shared cache reveals what others scanned (and when). Only the edge function reads it.
drop policy "signed-in users: read" on public.product_cache;
revoke select on public.product_cache from authenticated;

-- L2: 8-character codes, uniform over 32 symbols without look-alikes (40 bits).
alter table public.buddy_invites drop constraint buddy_invites_code_check;
delete from public.buddy_invites;
alter table public.buddy_invites add constraint buddy_invites_code_check check (code ~ '^[A-Z2-9]{8}$');

create or replace function public.create_buddy_invite() returns text
language plpgsql security definer set search_path = '' as $$
declare
  v_user uuid := auth.uid();
  v_alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_bytes bytea;
  v_code text;
begin
  if v_user is null or coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) then
    raise exception 'not signed in' using errcode = '42501';
  end if;
  delete from public.buddy_invites where inviter = v_user or expires_at < now();
  loop
    v_bytes := extensions.gen_random_bytes(8);
    v_code := '';
    for i in 0..7 loop
      v_code := v_code || substr(v_alphabet, (get_byte(v_bytes, i) % 32) + 1, 1);
    end loop;
    exit when not exists (select 1 from public.buddy_invites where code = v_code);
  end loop;
  insert into public.buddy_invites (code, inviter, expires_at) values (v_code, v_user, now() + interval '24 hours');
  return v_code;
end;
$$;

-- L1: claim the invite atomically, so one code can never link two people.
create or replace function public.accept_buddy_invite(p_code text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_user uuid := auth.uid();
  v_code text := upper(trim(coalesce(p_code, '')));
  v_inviter uuid;
  v_attempts int;
  v_my_name text;
  v_their_name text;
begin
  if v_user is null or coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) then
    raise exception 'not signed in' using errcode = '42501';
  end if;
  insert into public.buddy_attempts (user_id, day, count) values (v_user, current_date, 1)
    on conflict (user_id, day) do update set count = public.buddy_attempts.count + 1
    returning count into v_attempts;
  if v_attempts > 20 then return jsonb_build_object('status', 'limit'); end if;
  delete from public.buddy_invites
    where code = v_code and expires_at > now() and inviter <> v_user
    returning inviter into v_inviter;
  if v_inviter is null then
    if exists (select 1 from public.buddy_invites where code = v_code and inviter = v_user) then
      return jsonb_build_object('status', 'own');
    end if;
    return jsonb_build_object('status', 'invalid');
  end if;
  select left(coalesce(data ->> 'name', ''), 60) into v_my_name from public.profiles where id = v_user;
  select left(coalesce(data ->> 'name', ''), 60) into v_their_name from public.profiles where id = v_inviter;
  insert into public.buddy_links (user_id, buddy_id, buddy_name) values
    (v_user, v_inviter, coalesce(v_their_name, '')),
    (v_inviter, v_user, coalesce(v_my_name, ''))
  on conflict (user_id, buddy_id) do update set buddy_name = excluded.buddy_name;
  return jsonb_build_object('status', 'ok', 'name', coalesce(v_their_name, ''));
end;
$$;

-- M3: unlinking tells open pair channels right away, so both sides stop at once.
drop function public.remove_buddy(uuid);
create function public.remove_buddy(p_buddy uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'not signed in' using errcode = '42501'; end if;
  delete from public.buddy_links
  where (user_id = auth.uid() and buddy_id = p_buddy)
     or (user_id = p_buddy and buddy_id = auth.uid());
  perform realtime.send('{}'::jsonb, 'unlinked', public.pair_topic(auth.uid(), p_buddy), true);
end;
$$;
revoke execute on function public.remove_buddy(uuid) from public, anon;
grant execute on function public.remove_buddy(uuid) to authenticated;

-- L4: the pair channels carry broadcast messages only.
drop policy "buddies: receive" on realtime.messages;
drop policy "buddies: send" on realtime.messages;
create policy "buddies: receive" on realtime.messages for select to authenticated
  using (
    realtime.messages.extension = 'broadcast'
    and exists (
      select 1 from public.buddy_links bl
      where bl.user_id = (select auth.uid())
        and (select realtime.topic()) = public.pair_topic(bl.user_id, bl.buddy_id)
    )
  );
create policy "buddies: send" on realtime.messages for insert to authenticated
  with check (
    realtime.messages.extension = 'broadcast'
    and exists (
      select 1 from public.buddy_links bl
      where bl.user_id = (select auth.uid())
        and (select realtime.topic()) = public.pair_topic(bl.user_id, bl.buddy_id)
    )
  );
