-- Local seed (supabase db reset). Synthetic data only: no real people, phones, IDs or addresses.
-- Runs after all migrations on every local reset and in CI check 2.

-- This database is a developer / CI stack.
insert into private.runtime_env (id, env) values (true, 'local')
on conflict (id) do update set env = excluded.env, updated_at = now();

-- Shared synthetic fixtures (areas, demo users, demo auctions) live in supabase/seed/staging.sql.
-- config.toml [db.seed] loads that file right after this one, so local and staging look alike.
