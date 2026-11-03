-- BV1-B1: identity foundation (Basic v1). Profiles, roles, ID check, core lookups, settings, audit log,
-- mock SMS for phone OTP. Money, bids and auctions arrive in B2/B3; `media` and listings fields in B4.
-- Guardrails: RLS on every table, no client write to protected columns, status changes only through
-- SECURITY DEFINER functions, ID files in a private bucket.

-- ---------------------------------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------------------------------
create type public.kyc_tier as enum ('T0', 'T1', 'T2');
create type public.kyc_status as enum ('pending', 'approved', 'rejected');

-- ---------------------------------------------------------------------------------------------------
-- Helpers (private). The policy helpers need USAGE on the schema, nothing else is granted.
-- ---------------------------------------------------------------------------------------------------
create function private.env() returns text
language sql stable security definer set search_path = ''
as $$ select coalesce((select env from private.runtime_env where id), 'production') $$;

create function private.touch_updated_at() returns trigger
language plpgsql set search_path = ''
as $$ begin new.updated_at := now(); return new; end $$;

create function private.forbid_mutation() returns trigger
language plpgsql set search_path = ''
as $$ begin raise exception 'APPEND_ONLY' using errcode = 'P0001'; end $$;

-- ---------------------------------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------------------------------
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete restrict,
  phone      text not null unique check (phone ~ '^20(10|11|12|15)[0-9]{8}$'),
  name_ar    text check (char_length(name_ar) <= 120),
  name_en    text check (char_length(name_en) <= 120),
  locale     text not null default 'ar' check (locale in ('ar', 'en')),
  kyc_tier   public.kyc_tier not null default 'T0',
  status     text not null default 'active' check (status in ('active', 'suspended', 'banned')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_touch before update on public.profiles
  for each row execute function private.touch_updated_at();

create table public.user_roles (
  user_id    uuid not null references public.profiles (id) on delete cascade,
  role       text not null check (role in ('user', 'seller', 'kyc_admin', 'admin', 'super_admin')),
  granted_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

-- Role check used by RLS and by the admin functions. A user's own roles are never trusted from a JWT claim.
create function private.has_role(p_role text) returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles r
     where r.user_id = (select auth.uid())
       and (r.role = p_role or r.role = 'super_admin')
  )
$$;

create function private.is_admin() returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles r
     where r.user_id = (select auth.uid()) and r.role in ('kyc_admin', 'admin', 'super_admin')
  )
$$;

-- First login: create the profile and the base role. Idempotent.
create function private.handle_new_user() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if new.phone is not null then
    insert into public.profiles (id, phone) values (new.id, new.phone) on conflict do nothing;
    insert into public.user_roles (user_id, role) values (new.id, 'user') on conflict do nothing;
  end if;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function private.handle_new_user();

-- Defence in depth on top of column grants: clients cannot touch protected columns.
create function private.guard_profile_protected() returns trigger
language plpgsql set search_path = ''
as $$
begin
  if current_user in ('anon', 'authenticated')
     and (new.id, new.phone, new.kyc_tier, new.status, new.created_at)
         is distinct from (old.id, old.phone, old.kyc_tier, old.status, old.created_at) then
    raise exception 'PROTECTED_COLUMN' using errcode = '42501';
  end if;
  return new;
end $$;

create trigger profiles_guard before update on public.profiles
  for each row execute function private.guard_profile_protected();

alter table public.profiles enable row level security;
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (name_ar, name_en, locale) on public.profiles to authenticated;
create policy profiles_select_own on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy profiles_select_admin on public.profiles
  for select to authenticated using ((select private.is_admin()));
create policy profiles_update_own on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

alter table public.user_roles enable row level security;
revoke all on public.user_roles from anon, authenticated;
grant select on public.user_roles to authenticated;
create policy user_roles_select_own on public.user_roles
  for select to authenticated using (user_id = (select auth.uid()));
create policy user_roles_select_admin on public.user_roles
  for select to authenticated using ((select private.is_admin()));

-- ---------------------------------------------------------------------------------------------------
-- audit_logs (append-only, written by SECURITY DEFINER functions only)
-- ---------------------------------------------------------------------------------------------------
create table public.audit_logs (
  id         bigint generated always as identity primary key,
  actor_id   uuid,
  action     text not null,
  entity     text not null,
  entity_id  text not null,
  before_json jsonb,
  after_json  jsonb,
  reason     text,
  ts         timestamptz not null default clock_timestamp()
);
create index audit_logs_entity_idx on public.audit_logs (entity, entity_id, ts desc);
create trigger audit_logs_append_only before update or delete on public.audit_logs
  for each row execute function private.forbid_mutation();

alter table public.audit_logs enable row level security;
revoke all on public.audit_logs from anon, authenticated;
grant select on public.audit_logs to authenticated;
create policy audit_logs_select_admin on public.audit_logs
  for select to authenticated using ((select private.has_role('admin')));

create function private.audit(p_action text, p_entity text, p_entity_id text, p_before jsonb, p_after jsonb, p_reason text)
returns void language sql security definer set search_path = ''
as $$
  insert into public.audit_logs (actor_id, action, entity, entity_id, before_json, after_json, reason)
  values ((select auth.uid()), p_action, p_entity, p_entity_id, p_before, p_after, p_reason)
$$;

-- ---------------------------------------------------------------------------------------------------
-- app_settings (public flags readable by everyone, the rest by admins)
-- ---------------------------------------------------------------------------------------------------
create table public.app_settings (
  key         text primary key check (key ~ '^[a-z0-9_.]+$'),
  value       jsonb not null,
  is_public   boolean not null default false,
  description text,
  version     int not null default 1,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references public.profiles (id)
);
alter table public.app_settings enable row level security;
revoke all on public.app_settings from anon, authenticated;
grant select on public.app_settings to anon, authenticated;
create policy app_settings_select_public on public.app_settings
  for select to anon, authenticated using (is_public);
create policy app_settings_select_admin on public.app_settings
  for select to authenticated using ((select private.has_role('admin')));

insert into public.app_settings (key, value, is_public, description) values
  ('app.min_supported_version', '"1.0.0"', true, 'Oldest web build allowed to run'),
  ('kyc.max_pending_per_user', '1', false, 'Open ID checks allowed per user');

-- ---------------------------------------------------------------------------------------------------
-- Lookups and the property hub (minimal columns; B3/B4 extend them)
-- ---------------------------------------------------------------------------------------------------
create table public.areas (
  id      uuid primary key default gen_random_uuid(),
  slug    text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name_ar text not null,
  name_en text not null
);
create table public.compounds (
  id      uuid primary key default gen_random_uuid(),
  area_id uuid not null references public.areas (id),
  slug    text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name_ar text not null,
  name_en text not null
);
create index compounds_area_idx on public.compounds (area_id);

create table public.properties (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references public.profiles (id),
  area_id     uuid references public.areas (id),
  compound_id uuid references public.compounds (id),
  title_ar    text,
  title_en    text,
  kind        text not null default 'apartment' check (kind in ('apartment', 'villa', 'townhouse', 'duplex', 'penthouse', 'land', 'commercial')),
  bedrooms    smallint check (bedrooms between 0 and 20),
  area_sqm    int check (area_sqm > 0),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index properties_owner_idx on public.properties (owner_id);
create index properties_area_idx on public.properties (area_id);
create index properties_compound_idx on public.properties (compound_id);
create trigger properties_touch before update on public.properties
  for each row execute function private.touch_updated_at();

alter table public.areas enable row level security;
alter table public.compounds enable row level security;
alter table public.properties enable row level security;
revoke all on public.areas, public.compounds, public.properties from anon, authenticated;
grant select on public.areas, public.compounds to anon, authenticated;
grant select on public.properties to authenticated;
create policy areas_select_all on public.areas for select to anon, authenticated using (true);
create policy compounds_select_all on public.compounds for select to anon, authenticated using (true);
-- Owner sees own properties; public visibility comes with listings/auctions (B3/B4).
create policy properties_select_own on public.properties
  for select to authenticated using (owner_id = (select auth.uid()));
create policy properties_select_admin on public.properties
  for select to authenticated using ((select private.is_admin()));

-- ---------------------------------------------------------------------------------------------------
-- ID check (basic): three files in a private bucket, status set only by an admin function
-- ---------------------------------------------------------------------------------------------------
create table public.kyc_submissions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id),
  status        public.kyc_status not null default 'pending',
  front_path    text not null,
  back_path     text not null,
  selfie_path   text not null,
  reject_reason text,
  submitted_at  timestamptz not null default now(),
  decided_at    timestamptz,
  decided_by    uuid references public.profiles (id)
);
create unique index kyc_one_pending_per_user on public.kyc_submissions (user_id) where status = 'pending';
create index kyc_user_idx on public.kyc_submissions (user_id, submitted_at desc);
create index kyc_decided_by_idx on public.kyc_submissions (decided_by);

alter table public.kyc_submissions enable row level security;
revoke all on public.kyc_submissions from anon, authenticated;
grant select on public.kyc_submissions to authenticated;
create policy kyc_select_own on public.kyc_submissions
  for select to authenticated using (user_id = (select auth.uid()));
create policy kyc_select_admin on public.kyc_submissions
  for select to authenticated using ((select private.has_role('kyc_admin')));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('kyc-documents', 'kyc-documents', false, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Path convention: <uid>/<name>.<ext>. Owner may upload and read their own files; KYC admins read all.
-- No UPDATE or DELETE for clients.
create policy kyc_docs_owner_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'kyc-documents'
              and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy kyc_docs_owner_select on storage.objects
  for select to authenticated
  using (bucket_id = 'kyc-documents'
         and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy kyc_docs_admin_select on storage.objects
  for select to authenticated
  using (bucket_id = 'kyc-documents' and (select private.has_role('kyc_admin')));

-- User submits the three uploaded files. Idempotent for a repeated call while pending.
create function public.kyc_submit(p_front text, p_back text, p_selfie text)
returns public.kyc_submissions
language plpgsql security definer set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  prefix text := uid::text || '/';
  sub public.kyc_submissions;
begin
  if uid is null then raise exception 'NOT_AUTHENTICATED' using errcode = '28000'; end if;
  if left(p_front, length(prefix)) <> prefix or left(p_back, length(prefix)) <> prefix
     or left(p_selfie, length(prefix)) <> prefix then
    raise exception 'INVALID_PATH' using errcode = '22023';
  end if;
  if (select count(*) from storage.objects
       where bucket_id = 'kyc-documents' and name in (p_front, p_back, p_selfie)) <> 3 then
    raise exception 'FILES_MISSING' using errcode = '22023';
  end if;
  if exists (select 1 from public.profiles where id = uid and status <> 'active') then
    raise exception 'USER_NOT_ACTIVE' using errcode = '42501';
  end if;

  select * into sub from public.kyc_submissions where user_id = uid and status = 'pending';
  if found then return sub; end if;

  insert into public.kyc_submissions (user_id, front_path, back_path, selfie_path)
  values (uid, p_front, p_back, p_selfie) returning * into sub;
  perform private.audit('kyc.submit', 'kyc_submissions', sub.id::text, null, jsonb_build_object('status', 'pending'), null);
  return sub;
end $$;

-- Admin decision. Only a KYC admin may call it; approve sets T1 (T2 is out of scope).
create function public.admin_decide_kyc(p_submission uuid, p_approve boolean, p_reason text default null)
returns public.kyc_submissions
language plpgsql security definer set search_path = ''
as $$
declare
  sub public.kyc_submissions;
  uid uuid := (select auth.uid());
begin
  if uid is null or not (select private.has_role('kyc_admin')) then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
  select * into sub from public.kyc_submissions where id = p_submission for update;
  if not found then raise exception 'NOT_FOUND' using errcode = 'P0002'; end if;
  if sub.status <> 'pending' then return sub; end if;  -- idempotent
  if sub.user_id = uid then raise exception 'SELF_DECISION' using errcode = '42501'; end if;
  if not p_approve and coalesce(btrim(p_reason), '') = '' then
    raise exception 'REASON_REQUIRED' using errcode = '22023';
  end if;

  update public.kyc_submissions
     set status = case when p_approve then 'approved'::public.kyc_status else 'rejected'::public.kyc_status end,
         reject_reason = case when p_approve then null else p_reason end,
         decided_at = now(), decided_by = uid
   where id = p_submission returning * into sub;
  if p_approve then
    update public.profiles set kyc_tier = 'T1' where id = sub.user_id and kyc_tier = 'T0';
  end if;
  perform private.audit('kyc.decision', 'kyc_submissions', sub.id::text,
                        jsonb_build_object('status', 'pending'), jsonb_build_object('status', sub.status), p_reason);
  return sub;
end $$;

-- ---------------------------------------------------------------------------------------------------
-- Mock SMS for phone OTP (non-prod). Auth's Send SMS hook (a Postgres function) stores the code in an
-- outbox; the dev inbox reads it back. Production fails closed until a real provider is wired.
-- ---------------------------------------------------------------------------------------------------
create table private.dev_sms_outbox (
  id         bigint generated always as identity primary key,
  phone      text not null,
  otp        text not null,
  created_at timestamptz not null default now()
);
alter table private.dev_sms_outbox enable row level security;
revoke all on private.dev_sms_outbox from public, anon, authenticated;

create function private.send_sms_hook(event jsonb) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_phone text := regexp_replace(coalesce(event->'user'->>'phone', ''), '^\+', '');
begin
  if v_phone !~ '^20(10|11|12|15)[0-9]{8}$' then
    return jsonb_build_object('error', jsonb_build_object('http_code', 400, 'message', 'INVALID_PHONE'));
  end if;
  if private.env() = 'production' then
    return jsonb_build_object('error', jsonb_build_object('http_code', 503, 'message', 'SMS_PROVIDER_NOT_CONFIGURED'));
  end if;
  delete from private.dev_sms_outbox where created_at < now() - interval '24 hours';
  insert into private.dev_sms_outbox (phone, otp) values (v_phone, event->'sms'->>'otp');
  return '{}'::jsonb;
end $$;

grant usage on schema private to supabase_auth_admin;
grant execute on function private.send_sms_hook(jsonb) to supabase_auth_admin;

-- Dev inbox: the latest code for a phone. Refuses in production.
create function public.dev_sms_inbox(p_phone text) returns text
language plpgsql stable security definer set search_path = ''
as $$
begin
  if private.env() = 'production' then raise exception 'NOT_ALLOWED_IN_ENV' using errcode = '42501'; end if;
  return (select o.otp from private.dev_sms_outbox o
           where o.phone = regexp_replace(p_phone, '^\+', '') order by o.id desc limit 1);
end $$;

-- ---------------------------------------------------------------------------------------------------
-- Grants: policy helpers (used inside RLS) and the client-callable functions
-- ---------------------------------------------------------------------------------------------------
grant usage on schema private to authenticated;
grant execute on function private.has_role(text), private.is_admin() to authenticated;
revoke execute on function public.kyc_submit(text, text, text), public.admin_decide_kyc(uuid, boolean, text),
  public.dev_sms_inbox(text) from public;
grant execute on function public.kyc_submit(text, text, text), public.admin_decide_kyc(uuid, boolean, text) to authenticated;
grant execute on function public.dev_sms_inbox(text) to anon, authenticated;
