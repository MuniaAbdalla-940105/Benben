# Task prompt: Basic v1 B2 → supabase-backend + integration + react-frontend

## 1. Role and seniority
You are a principal fintech backend engineer with 14 years of experience building double-entry ledgers, payment-gateway webhooks and wallet holds, including 4 years on Supabase. You are known for idempotent money flows that pass audits. Principal level because this package moves money. Frontend parts go to a senior React engineer.

## 2. Context
- Basic v1 (ADR-006), **wave 2**, in parallel with B3, B4 and B5. B1 has provided the shell, auth, profiles and the UI kit.
- B3 (auctions) calls your lock and release functions **by the ST-008 contract signatures**. Keep those names and signatures exactly.

## 3. Task
1. **Ledger and wallet** per contract ST-006: accounts, double-entry `ledger_entries`, derived balances (available, locked, pending), `wallet_locks`. Nothing writes a balance directly.
2. **Mock gateway** per ST-007:
   - a `payments-create-intent` Edge Function;
   - the `mock-gateway` checkout page (PAY-01, non-prod only);
   - a signed `payments-webhook` (HMAC, idempotent on `gateway_txn_id`, raw event stored);
   - the inquiry sweep for delayed webhooks (A2);
   - success, decline and duplicate cases.
3. **Deposit lock** per ST-008:
   - `join_auction()`: T&C acceptance is logged (version, timestamp, IP), and EGP 5,000 (configurable per auction) is locked from Available;
   - "Join & Lock" in one step through the gateway;
   - `release_lock()` and `forfeit_lock()` are server-only, for B3 and B6 to call.
4. **Wallet screen** (WAL-01, basic): balances, mock top-up, pending payments, history. **No withdrawals** (shown disabled).

## 4. Inputs
- `docs/design/contracts/ST-006.md`, `ST-007.md`, `ST-008.md`, `DATA_MODEL.md`; ADR-002 §8 and §9
- `docs/design/screens/WAL-01-wallet.html`, `PAY-01-mock-checkout.html`, `AU-04-join-to-bid.html` (the sheet UI belongs to B3; you provide the API)
- `backlog/BASIC-V1.md`, ADR-006; the B1 interfaces in its PR or `README.md`

## 5. Constraints
- Branch `bv1-b2-wallet-mock-payments-deposit-lock`. Migrations `<ts>_bv1_b2_*.sql` with down scripts. Commits end `Refs: BV1-B2`.
- Money is `bigint` piasters, no negative balances, and every write is idempotent. Credit **only** from a verified webhook or the inquiry, never from the client redirect.
- Out of scope: withdrawals, refunds and chargebacks (manual for Finance), real Paymob.

## 6. Acceptance criteria
- Top-up through the mock gateway credits Available only after the signed webhook. A duplicate webhook does not double-credit (A3).
- A delayed webhook shows "pending" and is resolved by the inquiry sweep (A2).
- Joining locks 5,000. Two concurrent joins cannot over-lock. Release returns the money to Available.
- RLS: a user sees only their own wallet. pgTAP and Deno tests pass, and CI is green.

## 7. Deliverables
A PR titled `BV1-B2 Wallet, mock payments and deposit lock`, listing the function signatures B3 and B6 use.

## 8. Self-check
- [ ] Ledger entries balance (sum of debits = sum of credits) in tests.
- [ ] `security` review done (mandatory: money).
- [ ] Do not merge.
