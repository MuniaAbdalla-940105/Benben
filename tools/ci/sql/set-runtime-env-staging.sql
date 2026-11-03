-- Run by the staging deploy job after `supabase db push` (ADR-002 §4). Never by a migration.
-- Review M5: never overwrites 'production', and raises unless the database ends up marked 'staging',
-- so a mis-pointed deploy stops here before the seed or the functions touch anything.
insert into private.runtime_env (id, env) values (true, 'staging')
on conflict (id) do update set env = excluded.env, updated_at = now()
 where private.runtime_env.env <> 'production';

do $$
declare
  marked text := (select env from private.runtime_env where id);
begin
  if marked is distinct from 'staging' then
    raise exception 'refusing to deploy: private.runtime_env is % on this database, expected staging', coalesce(marked, '<missing>');
  end if;
end
$$;
