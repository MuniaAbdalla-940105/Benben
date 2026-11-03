-- ST-001 smoke test: the baseline schema, RLS, default privileges, Vault and the environment marker.
-- Run with `supabase test db`.
begin;
create extension if not exists pgtap with schema extensions;

select plan(17);

-- Schema and table ---------------------------------------------------------------------------------
select has_schema('private', 'private schema exists');
select has_table('private', 'runtime_env', 'private.runtime_env exists');
select ok(
  (select relrowsecurity from pg_class where oid = 'private.runtime_env'::regclass),
  'RLS is enabled on private.runtime_env'
);
select is((select env from private.runtime_env where id), 'local', 'the local seed marks this database as local');

-- No client access to private ---------------------------------------------------------------------
select ok(not has_schema_privilege('anon', 'private', 'USAGE'), 'anon has no USAGE on schema private');
select ok(has_schema_privilege('authenticated', 'private', 'USAGE'), 'authenticated has USAGE on private (RLS policy helpers only, BV1-B1)');
select ok(not has_function_privilege('authenticated', 'private.env()', 'EXECUTE'), 'authenticated cannot execute private.env()');
select ok(not has_table_privilege('anon', 'private.runtime_env', 'SELECT'), 'anon cannot read runtime_env');

-- Constraints ---------------------------------------------------------------------------------------
select throws_ok(
  $$ insert into private.runtime_env (id, env) values (false, 'staging') $$,
  '23514', null, 'runtime_env holds a single row (id must be true)'
);
select throws_ok(
  $$ insert into private.runtime_env (id, env) values (true, 'qa')
     on conflict (id) do update set env = excluded.env $$,
  '23514', null, 'runtime_env.env only accepts local, staging or production'
);

-- Default privileges (review M4/A7): new objects get no client privileges until granted explicitly ---
create table public.st001_smoke_default_acl (id int primary key);
create function public.st001_smoke_default_acl_fn() returns int language sql as $$ select 1 $$;
create table private.st001_smoke_default_acl (id int primary key);
select ok(not has_table_privilege('anon', 'public.st001_smoke_default_acl', 'SELECT'),
  'a new public table is not readable by anon by default');
select ok(not has_table_privilege('authenticated', 'public.st001_smoke_default_acl', 'INSERT'),
  'a new public table is not writable by authenticated by default');
select ok(not has_function_privilege('anon', 'public.st001_smoke_default_acl_fn()', 'EXECUTE'),
  'a new public function is not executable by anon by default');
select ok(has_table_privilege('service_role', 'public.st001_smoke_default_acl', 'SELECT'),
  'service_role keeps its default grants');
select ok(not has_table_privilege('authenticated', 'private.st001_smoke_default_acl', 'SELECT'),
  'a new private table is not readable by authenticated by default');

-- Vault (review A9) ---------------------------------------------------------------------------------
select set_eq(
  $$ select name from vault.secrets where name in ('pii_key', 'pii_pepper', 'reserve_key', 'cron_secret') $$,
  array['pii_key', 'pii_pepper', 'reserve_key', 'cron_secret'],
  'the seed created the four Vault secrets'
);

-- Fail closed (review A8): with the row gone the staging seed guard must refuse to run.
-- The statement below is the guard at the top of supabase/seed/staging.sql (keep them identical);
-- CI check 2 also runs the real file against a deleted row (tools/ci/check-migrations-fresh.sh).
delete from private.runtime_env;
select throws_ok(
  $guard$
  do $$
  declare
    current_env text := coalesce((select env from private.runtime_env where id), 'production');
  begin
    if current_env = 'production' then
      raise exception 'seed/staging.sql refused: private.runtime_env is % (missing row = production)', current_env;
    end if;
  end
  $$;
  $guard$,
  'P0001',
  'seed/staging.sql refused: private.runtime_env is production (missing row = production)',
  'with no runtime_env row the staging seed guard treats the database as production and refuses'
);

select * from finish();
rollback;
