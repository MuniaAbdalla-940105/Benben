-- Ensures the Vault secrets named in ADR-002 §15 exist. Run by the staging deploy job (and safe locally).
-- Values are generated inside the database (32 random bytes, base64) and never leave it: nothing is in Git,
-- in CI logs or in GitHub secrets. Existing secrets are never overwritten, so this is idempotent.
-- Rotation is a deliberate, story-owned change (ADR-002 §12: re-encrypt with a new key_version).
do $$
declare
  s record;
begin
  for s in
    select * from (values
      ('pii_key',     'pgp_sym key for national_id_enc (ADR-002 §12)'),
      ('pii_pepper',  'HMAC pepper for national_id_hash (ADR-002 §12)'),
      ('reserve_key', 'pgp_sym key for private.auction_reserves (ADR-002 §12)'),
      ('cron_secret', 'shared secret for pg_cron -> Edge Function calls (ADR-002 §7)')
    ) as v(name, description)
  loop
    if not exists (select 1 from vault.secrets where name = s.name) then
      perform vault.create_secret(encode(extensions.gen_random_bytes(32), 'base64'), s.name, s.description);
      raise notice 'created vault secret %', s.name;
    end if;
  end loop;
end
$$;
