# Task prompt: Basic v1 B6 → react-frontend + supabase-backend

## 1. Role and seniority
A staff engineer with 12 years of experience building internal ops and back-office tools for marketplaces and fintech: RBAC, audit logs, review queues. Staff level because admins act on identity, auctions and money.

## 2. Context
Basic v1 (ADR-006), **wave 3**, after B2 to B5 are merged. Admin staff work on desktop in Arabic or English (Q-87). The shell comes from B1 (`apps/admin`).

## 3. Task
1. **Admin shell and roles** (ST-020 basic, AD-SHELL and AD-15 prototypes):
   - sidebar;
   - staff roles: Super Admin, Ops, Auction Control, KYC Reviewer, Finance, Content Reviewer;
   - assign and remove roles;
   - every admin action written to `audit_logs`.
2. **Approval queues**:
   - **ID checks** (approve or reject with reason, side-by-side images; ST-022 basic);
   - **listings, investment and rentals** through `content_submissions` (approve / request changes / reject).
3. **Auctions ops**:
   - create an auction for a property on behalf of a seller (ST-023 basic: property, documents, start/reserve/increment/deposit);
   - approve and schedule (ST-024 basic, minimum 48h ahead or overridable in staging);
   - a **live auctions list** (AD-02 basic) with pause/resume (time compensation) and cancel (releases all locks), each with a reason.
4. **Payments log**: payments, ledger entries, locks per user, read-only (ST-043 basic).
5. A users list with search and a detail view (profile, tier, roles, wallet, auctions).

## 4. Inputs
- `docs/design/screens/AD-SHELL-admin-shell.html`, `AD-15-admin-users-audit.html`, `design-system.md`
- The functions merged by B1 to B5 (read their PR bodies and code), stories ST-020, ST-022–ST-025, ST-043, ADR-002 §10–§11, `backlog/BASIC-V1.md`, ADR-006

## 5. Constraints
- Branch `bv1-b6-admin-ops-basic`. Migrations `<ts>_bv1_b6_*.sql`. Commits end `Refs: BV1-B6`.
- Every admin write goes through a function that checks the role and writes the audit log. No service-role key in the admin bundle.
- Out of scope: maker-checker second approvals, analytics, CMS, bulk import, disputes, withdrawals, global search.

## 6. Acceptance criteria
- Each role sees only its modules, and a non-staff user is blocked.
- An approved ID raises the user to T1. An approved listing goes public.
- A created and scheduled auction goes LIVE on time; pause and cancel work and are audited.
- CI is green.

## 7. Deliverables
A PR titled `BV1-B6 Admin ops (basic)`.

## 8. Self-check
- [ ] The `security` review is done (RBAC, audit).
- [ ] Do not merge.
