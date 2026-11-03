-- Staging seed. SYNTHETIC DATA ONLY (CLAUDE.md guardrail "No real or production data in agent
-- environments"; ST-001 acceptance criterion; PRD-questions Q-74).
--
-- Rules for anyone adding to this file:
--   * Idempotent: the deploy job runs it after every merge to main. Use `on conflict do nothing/update`.
--   * People: invented names, emails only at example.com / example.org, phone numbers only from the
--     reserved test range +20 100 000 0xxx, national IDs only from the mock-KYC fixture list.
--   * Places: public area names only (New Cairo, Sheikh Zayed and their public districts), no street
--     addresses of real properties.
--   * tools/ci/check-seed-synthetic.sh enforces the email and phone rules in CI.
--
-- It also runs locally from seed.sql, so it must not assume runtime_env = 'staging'.

do $$
declare
  current_env text := coalesce((select env from private.runtime_env where id), 'production');
begin
  if current_env = 'production' then
    raise exception 'seed/staging.sql refused: private.runtime_env is % (missing row = production)', current_env;
  end if;
end
$$;

-- No domain tables exist yet (ST-001 only creates private.runtime_env). Area fixtures for New Cairo and
-- Sheikh Zayed are added here by the first story that creates the areas table.
