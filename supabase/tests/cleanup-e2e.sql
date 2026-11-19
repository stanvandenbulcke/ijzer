-- Removes the throw-away users that the e2e tests create in ijzer-dev (and, by cascade,
-- all their rows). Usage: node scripts/run-sql.mjs supabase/tests/cleanup-e2e.sql dev
delete from auth.users where email like 'e2e-%@example.com';
select 'cleaned' as result;
