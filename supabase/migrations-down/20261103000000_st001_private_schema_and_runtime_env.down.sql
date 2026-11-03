-- Down for 20261103000000_st001_private_schema_and_runtime_env.sql
-- Used by CI check 3 (up -> down -> up) and by the rollback procedure in docs/runbook.md.
drop table if exists private.runtime_env;
drop schema if exists private;

-- Restore the default privileges the up migration removed (the Supabase defaults for the migration role).
alter default privileges in schema public grant all on functions to anon, authenticated;
alter default privileges in schema public grant all on sequences to anon, authenticated;
alter default privileges in schema public grant all on tables    to anon, authenticated;
alter default privileges grant execute on functions to public;
