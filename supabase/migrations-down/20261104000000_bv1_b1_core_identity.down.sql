-- Down for 20261104000000_bv1_b1_core_identity.sql
drop policy if exists kyc_docs_owner_insert on storage.objects;
drop policy if exists kyc_docs_owner_select on storage.objects;
drop policy if exists kyc_docs_admin_select on storage.objects;
-- The private bucket 'kyc-documents' stays: Storage forbids deleting its rows from SQL, and with the
-- policies gone it is unreachable for clients. Remove it through the Storage API if needed.

drop function if exists public.dev_sms_inbox(text);
drop function if exists public.admin_decide_kyc(uuid, boolean, text);
drop function if exists public.kyc_submit(text, text, text);
drop function if exists private.send_sms_hook(jsonb);
drop table if exists private.dev_sms_outbox;
drop table if exists public.kyc_submissions;
drop table if exists public.properties;
drop table if exists public.compounds;
drop table if exists public.areas;
drop table if exists public.app_settings;
drop function if exists private.audit(text, text, text, jsonb, jsonb, text);
drop table if exists public.audit_logs;
drop trigger if exists on_auth_user_created on auth.users;
drop table if exists public.user_roles;
drop table if exists public.profiles;
drop function if exists private.handle_new_user();
drop function if exists private.guard_profile_protected();
drop function if exists private.is_admin();
drop function if exists private.has_role(text);
drop function if exists private.forbid_mutation();
drop function if exists private.touch_updated_at();
drop function if exists private.env();
drop type if exists public.kyc_status;
drop type if exists public.kyc_tier;
revoke usage on schema private from authenticated, supabase_auth_admin;
