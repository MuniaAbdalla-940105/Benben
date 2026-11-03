# Task prompt: Basic v1 B1 → react-frontend + supabase-backend (+ integration for mock SMS/KYC)

## 1. Role and seniority
- **Backend (staff):** a staff full-stack engineer with 12 years of experience in Postgres/Supabase (RLS, auth hooks, storage policies). Staff level because this package covers identity and personal data.
- **Frontend (senior):** a senior React + TypeScript engineer with 10 years of experience building Arabic-first RTL PWAs from design systems.

## 2. Context
- BEN-BEN Basic v1 (ADR-006, `backlog/BASIC-V1.md`): the whole product in a basic form in 2 days. **B1 is wave 1.** Every wave 2 package (B2 to B5) builds on it, so finish fast and keep the interfaces stable.
- Users: everyday Egyptian buyers and sellers, phone-first, Arabic RTL by default, plus English.
- Monorepo, CI and staging come from ST-001 (`README.md`, ADR-002 §3, ADR-005).

## 3. Task
1. **UI kit** (`packages/ui`): tokens from `docs/design/tokens.css` and `tailwind-theme.js`; the components the screens need (Button, TextField, PhoneField, OtpInput, Card, ListRow, Badge/LivePill, BottomSheet, Modal, Toast, Tabs, EmptyState, Skeleton, MoneySummary, CountdownText/Ring). Light and dark follow the phone setting. Reduced motion supported.
2. **Shared** (`packages/shared`): money in piasters (`formatEGP`, `parseEGPInput` with Arabic-Indic digits), `serverNow()` time sync, error codes from DATA_MODEL §6, idempotency keys (ADR-002 §15 ST-002).
3. **App shell** (`apps/web`) per `docs/design/screens/SHELL-app-shell.html`:
   - bottom nav Auctions (centre) · Explore · Rent · Requests · Profile/Wallet;
   - i18n AR/EN with RTL;
   - a digits toggle;
   - routes stubbed for B2 to B5, with a `routes.ts` registry each package adds to.
4. **Auth** (ST-004 contract): phone OTP through the mock SMS (dev inbox in non-prod); a profile created on first login; roles (user, seller, admin roles) in a table with RLS.
5. **ID check, basic** (ST-005 and ST-021 simplified):
   - the user uploads ID front and back plus a selfie to private storage;
   - status `pending → approved/rejected`, set only by an admin function (the B6 screen comes later);
   - `kyc_tier` on the profile (T0/T1/T2);
   - **no OCR or liveness vendor.**
6. **Core schema** (DATA_MODEL): `profiles`, `user_roles`, `areas`, `compounds`, `properties`, `media` (storage-backed), `app_settings`, `audit_logs`. Seed New Cairo and Sheikh Zayed areas with synthetic compounds.
7. **Admin shell** (`apps/admin`): login and the role gate only (B6 fills it in).
8. Add an exported type and route registry note to `README.md` for the other packages.

## 4. Inputs
- `backlog/BASIC-V1.md`, `docs/decisions/ADR-002…`, `ADR-003…`, `ADR-006…`
- `docs/design/contracts/DATA_MODEL.md`, `ST-004.md`, `ST-005.md`
- `docs/design/design-system.md`, `docs/design/screens/SHELL-app-shell.html`, `AUTH-01-phone-otp.html`, `KYC-01-t1-id-selfie.html`, `DS-components.html`
- Stories ST-002, ST-003, ST-004, ST-005, ST-021

## 5. Constraints
- Branch `bv1-b1-shell-auth-core-schema`. Commits per `CLAUDE.md`, ending `Refs: BV1-B1`.
- Migrations named `<ts>_bv1_b1_*.sql`, each with a down script.
- **Guardrails:** RLS on every table; ID files in a private bucket readable only by the owner and KYC admins; no service-role key in the browser.
- Out of scope: wallet (B2), auctions (B3), listings (B4), B5 sections, admin screens (B6).

## 6. Acceptance criteria
- A new user signs up by phone OTP (mock), sees the shell in Arabic RTL, switches to English and dark mode, uploads ID and a selfie, and sees "pending review".
- An admin function approves the ID, and the user's tier becomes T1.
- User A cannot read user B's profile private fields or ID files (pgTAP).
- CI is green.

## 7. Deliverables
- A PR into `main` titled `BV1-B1 App shell, auth, ID upload and core schema`, with a verify checklist and the preview URL.
- A short "interfaces for other packages" section in the PR body: tables, types, `routes.ts`, UI components.

## 8. Self-check
- [ ] RLS and pgTAP tests are in place, and CI is green.
- [ ] Screens match the prototypes closely in RTL, LTR, light and dark.
- [ ] The `security` review is done (identity data).
- [ ] Do not merge; the orchestrator merges.
