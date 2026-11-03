-- Run by the staging deploy job after `supabase db push` (ADR-002 §4). Never by a migration.
insert into private.runtime_env (id, env) values (true, 'staging')
on conflict (id) do update set env = excluded.env, updated_at = now();
