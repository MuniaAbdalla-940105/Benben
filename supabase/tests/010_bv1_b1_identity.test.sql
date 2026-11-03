-- BV1-B1: identity, roles, ID check and storage. User A must not read user B's private data or ID files.
begin;
create extension if not exists pgtap with schema extensions;

select plan(29);

-- Fixtures: two users, one KYC admin (synthetic phones only). The trigger creates profiles and roles.
insert into auth.users (id, instance_id, aud, role, phone, created_at, updated_at) values
  ('a0000000-0000-4000-8000-00000000000a', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', '201000000501', now(), now()),
  ('b0000000-0000-4000-8000-00000000000b', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', '201000000502', now(), now()),
  ('c0000000-0000-4000-8000-00000000000c', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', '201000000503', now(), now());
insert into public.user_roles (user_id, role) values ('c0000000-0000-4000-8000-00000000000c', 'kyc_admin');
insert into storage.objects (bucket_id, name) values
  ('kyc-documents', 'a0000000-0000-4000-8000-00000000000a/front.jpg'),
  ('kyc-documents', 'a0000000-0000-4000-8000-00000000000a/back.jpg'),
  ('kyc-documents', 'a0000000-0000-4000-8000-00000000000a/selfie.jpg'),
  ('kyc-documents', 'b0000000-0000-4000-8000-00000000000b/front.jpg');

select is((select count(*)::int from public.profiles where id in ('a0000000-0000-4000-8000-00000000000a', 'b0000000-0000-4000-8000-00000000000b')), 2, 'a profile is created on first login');
select is((select count(*)::int from public.user_roles where role = 'user' and user_id = 'a0000000-0000-4000-8000-00000000000a'), 1, 'new users get the user role');
select is((select kyc_tier::text from public.profiles where id = 'a0000000-0000-4000-8000-00000000000a'), 'T0', 'new users start at T0');

-- anon sees nothing private
set local role anon;
select throws_ok($$ select * from public.profiles $$, '42501', null, 'anon cannot read profiles');
select throws_ok($$ select * from public.kyc_submissions $$, '42501', null, 'anon cannot read ID checks');
select ok((select count(*) from public.areas) >= 0, 'anon can read the area lookup');
reset role;

-- User A
set local role authenticated;
select set_config('request.jwt.claim.sub', 'a0000000-0000-4000-8000-00000000000a', true);

select is((select count(*)::int from public.profiles), 1, 'A sees exactly one profile');
select is((select count(*)::int from public.profiles where id = 'b0000000-0000-4000-8000-00000000000b'), 0, 'A cannot read B''s profile (phone and tier)');
select is((select count(*)::int from public.user_roles), 1, 'A sees only their own roles');
select is((select count(*)::int from storage.objects where bucket_id = 'kyc-documents' and name like 'b0000000%'), 0, 'A cannot read B''s ID files');
select is((select count(*)::int from storage.objects where bucket_id = 'kyc-documents' and name like 'a0000000%'), 3, 'A can read their own ID files');
select throws_ok(
  $$ insert into storage.objects (bucket_id, name) values ('kyc-documents', 'b0000000-0000-4000-8000-00000000000b/hack.jpg') $$,
  '42501', null, 'A cannot upload into B''s folder');
select lives_ok($$ update public.profiles set name_ar = 'اختبار', locale = 'en' where id = 'a0000000-0000-4000-8000-00000000000a' $$, 'A can edit their name and locale');
select throws_ok($$ update public.profiles set kyc_tier = 'T1' where id = 'a0000000-0000-4000-8000-00000000000a' $$, '42501', null, 'A cannot set their own tier');
update public.profiles set name_en = 'x' where id = 'b0000000-0000-4000-8000-00000000000b';
select is((select count(*)::int from public.profiles where name_en = 'x'), 0, 'A cannot edit B''s profile');
select throws_ok($$ insert into public.user_roles (user_id, role) values ('a0000000-0000-4000-8000-00000000000a', 'super_admin') $$, '42501', null, 'A cannot grant themselves a role');
select throws_ok($$ select public.admin_decide_kyc(gen_random_uuid(), true, null) $$, '42501', null, 'A cannot call the admin decision');
select throws_ok($$ select public.kyc_submit('a0000000-0000-4000-8000-00000000000a/front.jpg', 'a0000000-0000-4000-8000-00000000000a/back.jpg', 'a0000000-0000-4000-8000-00000000000a/none.jpg') $$, '22023', null, 'a submission needs all three uploaded files');
select throws_ok($$ select public.kyc_submit('b0000000-0000-4000-8000-00000000000b/front.jpg', 'a0000000-0000-4000-8000-00000000000a/back.jpg', 'a0000000-0000-4000-8000-00000000000a/selfie.jpg') $$, '22023', null, 'A cannot submit B''s file');
select is((select status::text from public.kyc_submit('a0000000-0000-4000-8000-00000000000a/front.jpg', 'a0000000-0000-4000-8000-00000000000a/back.jpg', 'a0000000-0000-4000-8000-00000000000a/selfie.jpg')), 'pending', 'A''s ID check is pending review');
reset role;

-- User B cannot see A's check
set local role authenticated;
select set_config('request.jwt.claim.sub', 'b0000000-0000-4000-8000-00000000000b', true);
select is((select count(*)::int from public.kyc_submissions), 0, 'B cannot read A''s ID check');
reset role;

-- KYC admin approves: tier becomes T1, the audit row is written and cannot be changed
set local role authenticated;
select set_config('request.jwt.claim.sub', 'c0000000-0000-4000-8000-00000000000c', true);
select is((select status::text from public.admin_decide_kyc((select id from public.kyc_submissions limit 1), true, null)), 'approved', 'the admin approves the ID check');
select is((select count(*)::int from storage.objects where bucket_id = 'kyc-documents'), 4, 'the KYC admin can read ID files');
reset role;
select is((select kyc_tier::text from public.profiles where id = 'a0000000-0000-4000-8000-00000000000a'), 'T1', 'the user''s tier becomes T1');
select throws_ok($$ update public.audit_logs set reason = 'x' $$, 'P0001', 'APPEND_ONLY', 'the audit log is append-only');

-- Mock SMS: the Auth hook stores the code, the dev inbox returns it outside production, and fails closed in production
select is(private.send_sms_hook('{"user":{"phone":"+201000000501"},"sms":{"otp":"654321"}}'::jsonb), '{}'::jsonb, 'the SMS hook accepts a valid phone');
select is(public.dev_sms_inbox('+201000000501'), '654321', 'the dev inbox returns the latest code outside production');
select is(private.send_sms_hook('{"user":{"phone":"+15551234567"},"sms":{"otp":"1"}}'::jsonb)->'error'->>'message', 'INVALID_PHONE', 'the SMS hook rejects non-Egyptian numbers');
delete from private.runtime_env;
select throws_ok($$ select public.dev_sms_inbox('201000000501') $$, '42501', 'NOT_ALLOWED_IN_ENV', 'the dev inbox refuses in production');

select * from finish();
rollback;
