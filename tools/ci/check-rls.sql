-- CI check 6 (ADR-002 §10, §15). Run by tools/ci/check-rls.sh, which sets ci.rpc_allowlist.
--   a. every table (and partitioned table) in schemas public and private has row level security enabled;
--   b. no function in schema public is executable by anon or authenticated unless allow-listed;
--   c. no function in schema private is executable by anon or authenticated unless it is an RLS helper
--      (granted explicitly in a later story and listed under "private." in the allow-list).
-- Functions owned by extensions are ignored (they are not ours to grant).
do $$
declare
  allowlist text[] := string_to_array(nullif(current_setting('ci.rpc_allowlist', true), ''), ',');
  no_rls    text;
  exposed   text;
begin
  allowlist := coalesce(allowlist, '{}');

  select string_agg(format('%I.%I', n.nspname, c.relname), ', ' order by 1)
    into no_rls
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
   where n.nspname in ('public', 'private')
     and c.relkind in ('r', 'p')
     and not c.relrowsecurity;

  select string_agg(distinct format('%I.%I(%s) (%s)', n.nspname, p.proname,
                                     pg_get_function_identity_arguments(p.oid), r.rolname), ', ')
    into exposed
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
   cross join (values ('anon'), ('authenticated')) as r(rolname)
   where n.nspname in ('public', 'private')
     and p.prokind in ('f', 'p')
     and has_function_privilege(r.rolname, p.oid, 'EXECUTE')
     and not exists (select 1 from pg_depend d
                      where d.classid = 'pg_proc'::regclass and d.objid = p.oid and d.deptype = 'e')
     and not (format('%s.%s', n.nspname, p.proname) = any (allowlist));

  if no_rls is not null or exposed is not null then
    raise exception using
      message = 'check-rls failed',
      detail  = concat_ws(E'\n',
                  case when no_rls  is not null then 'Tables without RLS: ' || no_rls end,
                  case when exposed is not null then 'Functions executable by anon/authenticated and not in tools/ci/rpc-allowlist.txt: ' || exposed end),
      hint    = 'Enable RLS on every table. REVOKE EXECUTE ... FROM public, anon, authenticated, then GRANT explicitly and add the function to the allow-list (ADR-002 §10).';
  end if;
end
$$;

select 'check-rls: all tables in public/private have RLS; no unlisted function is executable by anon/authenticated' as result;
