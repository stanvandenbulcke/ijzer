-- Tiny function for the keep-alive workflow (.github/workflows/keep-alive.yml): touches the
-- database so free projects do not pause, and reveals nothing (it only returns 1).
create or replace function public.keep_alive()
returns integer
language sql
stable
set search_path = ''
as $$ select 1 $$;

revoke all on function public.keep_alive() from public;
grant execute on function public.keep_alive() to anon, authenticated;
