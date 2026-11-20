-- Barcode lookups (SPEC §4.5): a shared cache of Open Food Facts products and a per-user daily
-- counter. Both are written ONLY by the `food-lookup` edge function (service role).

create table public.product_cache (
  barcode text primary key check (barcode ~ '^[0-9]{8,14}$'),
  -- Normalised product (supabase/functions/_shared/offNormalize.ts); null = not found on OFF.
  data jsonb check (data is null or octet_length(data::text) < 16384),
  source text not null default 'off',
  fetched_at timestamptz not null default now()
);
alter table public.product_cache enable row level security;
alter table public.product_cache force row level security;
-- Product data is public information (ODbL); signed-in users may read it, nobody may write.
create policy "signed-in users: read" on public.product_cache for select to authenticated using (true);
revoke all on public.product_cache from anon, authenticated;
grant select on public.product_cache to authenticated;

create table public.lookup_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  count int not null default 0,
  primary key (user_id, day)
);
alter table public.lookup_usage enable row level security;
alter table public.lookup_usage force row level security;
create policy "own rows: select" on public.lookup_usage for select to authenticated using (user_id = (select auth.uid()));
revoke all on public.lookup_usage from anon, authenticated;
grant select on public.lookup_usage to authenticated;

-- Counts one lookup and returns today's total. Only the edge function (service role) may call it.
create function public.bump_lookup_usage(p_user uuid, p_day date) returns int
language sql set search_path = '' as $$
  insert into public.lookup_usage (user_id, day, count) values (p_user, p_day, 1)
  on conflict (user_id, day) do update set count = public.lookup_usage.count + 1
  returning count;
$$;
revoke execute on function public.bump_lookup_usage(uuid, date) from public, anon, authenticated;
grant execute on function public.bump_lookup_usage(uuid, date) to service_role;
grant select, insert, update on public.product_cache, public.lookup_usage to service_role;
