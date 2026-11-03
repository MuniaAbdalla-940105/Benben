-- ST-001: the `private` schema and the environment marker (ADR-002 §4, §10).
--
-- `private` holds internal helpers and data that must never be reachable through PostgREST. It is not in
-- [api].schemas in config.toml, and client roles get no table privileges in it.
--
-- `private.runtime_env` records which environment this database is (local | staging | production).
-- Dev-only functions read it and fail closed: a missing row means production. The value is written by
-- seed.sql locally and by the staging deploy job; it is never written by a migration.

create schema if not exists private;

revoke all on schema private from public;
-- No USAGE for anon/authenticated yet. RLS helper functions in later stories (ST-004) grant USAGE plus
-- EXECUTE on the specific helpers only (ADR-002 §10).

create table private.runtime_env (
  id         boolean primary key default true check (id),  -- single-row table
  env        text not null check (env in ('local', 'staging', 'production')),
  updated_at timestamptz not null default now()
);

comment on table private.runtime_env is
  'Single row naming this database''s environment. Missing row = production (fail closed). Set by seed.sql (local) or the staging deploy job.';

-- RLS on every table, including private ones (ADR-002 §10, checked by tools/ci/check-rls.sql).
-- No policies: only the table owner and service_role (bypassrls) can read or write.
alter table private.runtime_env enable row level security;

revoke all on table private.runtime_env from public, anon, authenticated;
