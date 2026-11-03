-- ST-001: the `private` schema, the environment marker and locked-down default privileges
-- (ADR-002 §4, §10).
--
-- `private` holds internal helpers and data that must never be reachable through PostgREST. It is not in
-- [api].schemas in config.toml (asserted by tools/ci/check-rls.sh), and client roles get no table
-- privileges in it.
--
-- `private.runtime_env` records which environment this database is (local | staging | production).
-- Dev-only code fails closed: a missing row means production (ADR-002 §4; read through private.env(),
-- added by ST-004 per ADR-006). The value is written by seed.sql locally and by the staging deploy job; never by a
-- migration.

create schema if not exists private;

revoke all on schema private from public;
-- No USAGE for anon/authenticated yet. RLS helper functions in later stories (ST-004) grant USAGE plus
-- EXECUTE on the specific helpers only (ADR-002 §10).

-- ---------------------------------------------------------------------------------------------------
-- Default privileges (ADR-002 §10 "Defaults to remove"; review M4/A7). Objects that the migration role
-- creates later get no client privileges until a migration grants them explicitly:
--   * Postgres grants EXECUTE on every new function to PUBLIC; that default is global, so it is revoked
--     globally (this also covers schema private and any future schema).
--   * Supabase adds per-schema defaults in public that grant anon and authenticated everything on new
--     tables, sequences and functions; those are revoked. service_role keeps its grants.
--   * Schema private has no per-schema defaults: new tables there are owner-only, and new functions get
--     no PUBLIC EXECUTE because of the global revoke above.
-- tools/ci/check-rls.sql still checks every object, so a missing explicit REVOKE cannot slip through.
-- ---------------------------------------------------------------------------------------------------
alter default privileges revoke execute on functions from public;

alter default privileges in schema public revoke all on tables    from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke all on functions from anon, authenticated;

-- ---------------------------------------------------------------------------------------------------
-- Environment marker
-- ---------------------------------------------------------------------------------------------------
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
