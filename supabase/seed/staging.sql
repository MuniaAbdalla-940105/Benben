-- Staging seed. SYNTHETIC DATA ONLY (CLAUDE.md guardrail "No real or production data in agent
-- environments"; ST-001 acceptance criterion; PRD-questions Q-74).
--
-- Rules for anyone adding to this file:
--   * Idempotent: the deploy job runs it after every merge to main. Use `on conflict do nothing/update`.
--   * People: invented names, emails only at example.com / example.org / *.test, phone numbers only from
--     the reserved test range +20 100 000 0xxx, national IDs (14 digits) only with governorate code 99 in
--     digits 8-9 (no real governorate has 99).
--   * Places: public area names only (New Cairo, Sheikh Zayed and their public districts), no street
--     addresses of real properties.
--   * tools/ci/check-seed-synthetic.sh enforces the email and phone rules in CI, and CI
--     check 2 runs every seed file a second time and fails if any row count changes.
--
-- It also runs locally and in CI right after seed.sql, so it must not assume runtime_env = 'staging'.

do $$
declare
  current_env text := coalesce((select env from private.runtime_env where id), 'production');
begin
  if current_env = 'production' then
    raise exception 'seed/staging.sql refused: private.runtime_env is % (missing row = production)', current_env;
  end if;
end
$$;

-- Areas and compounds: public names only.
insert into public.areas (slug, name_ar, name_en) values
  ('new-cairo', 'القاهرة الجديدة', 'New Cairo'),
  ('sheikh-zayed', 'الشيخ زايد', 'Sheikh Zayed')
on conflict (slug) do nothing;

insert into public.compounds (area_id, slug, name_ar, name_en)
select a.id, c.slug, c.name_ar, c.name_en
  from (values
    ('new-cairo', 'demo-compound-fifth-settlement', 'كمبوند تجريبي - التجمع الخامس', 'Demo Compound - Fifth Settlement'),
    ('new-cairo', 'demo-compound-katameya', 'كمبوند تجريبي - القطامية', 'Demo Compound - Katameya'),
    ('new-cairo', 'demo-compound-mostakbal', 'كمبوند تجريبي - المستقبل', 'Demo Compound - Mostakbal'),
    ('sheikh-zayed', 'demo-compound-beverly', 'كمبوند تجريبي - بيفرلي', 'Demo Compound - Beverly'),
    ('sheikh-zayed', 'demo-compound-westown', 'كمبوند تجريبي - ويستاون', 'Demo Compound - Westown')
  ) as c(area_slug, slug, name_ar, name_en)
  join public.areas a on a.slug = c.area_slug
on conflict (slug) do nothing;

-- Synthetic KYC admin (phone from the reserved test range; OTP 123456 via config.toml test_otp).
insert into auth.users (id, instance_id, aud, role, phone, phone_confirmed_at, created_at, updated_at)
values ('00000000-0000-4000-8000-000000000099', '00000000-0000-0000-0000-000000000000',
        'authenticated', 'authenticated', '201000000099', now(), now(), now())
on conflict (id) do nothing;

insert into public.user_roles (user_id, role) values
  ('00000000-0000-4000-8000-000000000099', 'kyc_admin'),
  ('00000000-0000-4000-8000-000000000099', 'admin')
on conflict do nothing;
