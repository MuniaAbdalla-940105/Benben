# BEN-BEN demo POC (throwaway)

A clickable, fake-data tour of the whole product. No backend, no build step, synthetic data only. State lives in memory and `localStorage`.

## How to open
- Double-click `demo/index.html` (works from `file://`), or serve the folder as static files: `npx serve demo` or `python3 -m http.server -d demo`.
- On desktop it shows a phone frame; on a phone it fills the screen. Arabic RTL is the default; `EN`/`ع` and `◐` (auto, light, dark) are in the top bar.
- **Reset demo:** Profile → Reset demo, or the button beside the phone on wide screens.

## 2-minute walkthrough
1. **Login (15s):** press *Send code*, then *Verify*. Any code works.
2. **ID (15s):** tap the three upload boxes, *Submit for review* (pending), then *Simulate staff approval* (approved, Tier T1).
3. **Wallet (10s):** *Top up wallet*, pick 100,000, *Pay*. The balance and transaction appear.
4. **Auction (50s):** Auctions → *Live* auction (Mivida) → *Join to bid* → *Lock deposit & join*. In the live room the clock counts down and other bidders bid on their own ("You have been outbid"). Pick an increment and tap *Bid*. A bid in the last 20 seconds shows the anti-sniping "Extended" tag. Be the top bidder when the clock hits zero to win, then see the winner checklist.
5. **Tour the rest (30s):** Explore (area and price filters, save a listing, *List*), Rent (*Request to rent*, then Requests → Rentals), Requests (buy requests with matches, Invest with yields).
6. **Admin (optional):** Profile → *Staff admin (demo)*: approve an ID, then approve the pending listing. The listing appears in Explore and in your buy request's matches.

## Notes
- Money is held in piasters and shown as EGP, with Arabic-Indic digits in Arabic.
- Simulated: OTP, ID review, payments, other bidders. Auction clock is about 40 seconds (not 24 hours) so the demo is quick.
- Property pages (sale, auction, rental) have a 6-slide gallery (drawn illustrations, not real photos), facts, description, details, amenities, payment plan or lease terms, a stylised map with nearby places, and an agent card.
- Reuses the Ivory Ledger tokens (`assets/tokens.css`) and The Ascent logo from `docs/design`. System fonts only, so it works offline.
- Not production code. Real build follows `backlog/BASIC-V1.md`.
