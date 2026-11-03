-- CI check 6 (ADR-002 §10, §15; review M4, A5, L6). Run by tools/ci/check-rls.sh, which sets
-- ci.rpc_allowlist to a comma-separated list of function signatures "schema.name(argtype,argtype)".
--
-- Scope: every schema except the deny-list below (Postgres system schemas, schemas managed by Supabase,
-- and schemas owned by extensions). A new schema that a story creates is therefore checked automatically.
--   a. every table and partitioned table has row level security enabled;
--   b. every view has security_invoker = true (otherwise it bypasses the caller's RLS);
--   c. no materialized view or foreign table is readable by anon or authenticated (neither supports RLS);
--   d. no function is executable by anon or authenticated unless its exact signature is allow-listed.
-- Objects owned by extensions are ignored (they are not ours to grant).
do $$
declare
  allowlist text[] := coalesce(string_to_array(nullif(current_setting('ci.rpc_allowlist', true), ''), ';'), '{}');
  no_rls    text;
  bad_views text;
  exposed_m text;
  exposed_f text;
begin
  perform set_config('search_path', '', true);  -- so regprocedure/regtype print schema-qualified names

  create temp table ci_schemas on commit drop as
  select n.oid, n.nspname
    from pg_namespace n
   where n.nspname not in (
           'pg_catalog', 'information_schema', 'pg_toast',
           'auth', 'storage', 'realtime', '_realtime', 'extensions', 'graphql', 'graphql_public', 'vault',
           'pgbouncer', 'supabase_functions', 'supabase_migrations', 'net', 'cron', 'pgsodium',
           'pgsodium_masks', '_analytics', 'pgtle', 'pgmq', 'supabase_admin')
     and n.nspname not like 'pg\_temp\_%' and n.nspname not like 'pg\_toast\_temp\_%'
     and not exists (select 1 from pg_depend d
                      where d.classid = 'pg_namespace'::regclass and d.objid = n.oid and d.deptype = 'e');

  create temp table ci_relations on commit drop as
  select c.oid, s.nspname, c.relname, c.relkind, c.relrowsecurity, c.reloptions
    from pg_class c
    join ci_schemas s on s.oid = c.relnamespace
   where c.relkind in ('r', 'p', 'v', 'm', 'f')
     and not exists (select 1 from pg_depend d
                      where d.classid = 'pg_class'::regclass and d.objid = c.oid and d.deptype = 'e');

  select string_agg(format('%I.%I', nspname, relname), ', ' order by 1) into no_rls
    from ci_relations where relkind in ('r', 'p') and not relrowsecurity;

  select string_agg(format('%I.%I', nspname, relname), ', ' order by 1) into bad_views
    from ci_relations
   where relkind = 'v'
     and not coalesce(reloptions && array['security_invoker=true', 'security_invoker=on', 'security_invoker=1'], false);

  select string_agg(distinct format('%I.%I (%s, %s)', r.nspname, r.relname,
                                    case r.relkind when 'm' then 'materialized view' else 'foreign table' end,
                                    g.rolname), ', ') into exposed_m
    from ci_relations r
   cross join (values ('anon'), ('authenticated')) as g(rolname)
   where r.relkind in ('m', 'f') and has_table_privilege(g.rolname, r.oid, 'SELECT');

  select string_agg(distinct format('%s (%s)', p.oid::regprocedure, g.rolname), ', ') into exposed_f
    from pg_proc p
    join ci_schemas s on s.oid = p.pronamespace
   cross join (values ('anon'), ('authenticated')) as g(rolname)
   where p.prokind in ('f', 'p')
     and has_function_privilege(g.rolname, p.oid, 'EXECUTE')
     and not exists (select 1 from pg_depend d
                      where d.classid = 'pg_proc'::regclass and d.objid = p.oid and d.deptype = 'e')
     and not (replace(p.oid::regprocedure::text, ' ', '') = any (allowlist));

  if coalesce(no_rls, bad_views, exposed_m, exposed_f) is not null then
    raise exception using
      message = 'check-rls failed',
      detail  = concat_ws(E'\n',
                  'Tables without RLS: ' || no_rls,
                  'Views without security_invoker=true: ' || bad_views,
                  'Materialized views / foreign tables readable by anon/authenticated (no RLS possible): ' || exposed_m,
                  'Functions executable by anon/authenticated and not in tools/ci/rpc-allowlist.txt: ' || exposed_f),
      hint    = 'Enable RLS on every table; create views WITH (security_invoker = true); REVOKE SELECT on matviews and foreign tables from anon, authenticated; REVOKE EXECUTE ... FROM public, anon, authenticated, then GRANT explicitly and add the exact signature to the allow-list (ADR-002 §10).';
  end if;
end
$$;

select 'check-rls: RLS on every table, security_invoker on every view, no client-readable matview or foreign table, no unlisted client-executable function' as result;
