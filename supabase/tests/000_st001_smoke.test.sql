-- ST-001 smoke test: the baseline schema, RLS and environment marker. Run with `supabase test db`.
begin;
create extension if not exists pgtap with schema extensions;

select plan(8);

select has_schema('private', 'private schema exists');
select has_table('private', 'runtime_env', 'private.runtime_env exists');

select ok(
  (select relrowsecurity from pg_class where oid = 'private.runtime_env'::regclass),
  'RLS is enabled on private.runtime_env'
);

select is(
  (select env from private.runtime_env where id),
  'local',
  'the local seed marks this database as local'
);

select ok(
  not has_schema_privilege('anon', 'private', 'USAGE'),
  'anon has no USAGE on schema private'
);
select ok(
  not has_schema_privilege('authenticated', 'private', 'USAGE'),
  'authenticated has no USAGE on schema private'
);

select throws_ok(
  $$ insert into private.runtime_env (id, env) values (false, 'staging') $$,
  '23514',
  null,
  'runtime_env holds a single row (id must be true)'
);

select throws_ok(
  $$ insert into private.runtime_env (id, env) values (true, 'qa')
     on conflict (id) do update set env = excluded.env $$,
  '23514',
  null,
  'runtime_env.env only accepts local, staging or production'
);

select * from finish();
rollback;
