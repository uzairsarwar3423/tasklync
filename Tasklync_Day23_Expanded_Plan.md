# 📍 Tasklync — Day 23 (Expanded) — Address + Summary Screens
### Recognition-First Address Selection · Serial-Position-Ordered Review · Fully Componentized

> Senior engineering principle applied here: **one component = one responsibility.**
> Today closes the booking funnel's information-gathering half (Address) and builds the funnel's most information-dense screen (Summary). Both get split into small files — and, importantly, today we also **consolidate a shared footer primitive** so Schedule (Day 22), Address, and Summary (both today) all drive their sticky CTA off one component instead of three near-duplicate ones.

**Fonts (locked, no exceptions):**
- **Poppins** → screen titles, address labels ("Home"/"Office"), section headers on Summary ("Services," "Schedule," etc.)
- **Plus Jakarta Sans** → address lines, description/note input, "30 min to accept" banner copy, helper text
- **Inter** → price rows, subtotal/fee/total, date + time values shown on the Summary rows

---

## 1. Objective

Ship `booking/address` and `booking/summary` as **17 small composable files**, reuse `StepProgress` from Day 22 unmodified (`activeIndex=2` and `activeIndex=3`), reuse the generic pricing-row primitives from Day 21's Cart work, and introduce one shared `BookingFooterCTA` that retroactively simplifies Day 22's footer as well.

---

## 2. Full File/Folder Breakdown

```
app/
  booking/
    address.tsx                               — COMPOSITION ONLY (step 3)
    summary.tsx                                — COMPOSITION ONLY (step 4)

src/components/address/
  ├── AddressHeader.tsx                        — screen title + back button
  ├── AddressList.tsx                          — FlashList wrapper of AddressCard, owns selection sync
  ├── AddressCard.tsx                          — icon + address line + default badge, radio-style
  ├── AddressDefaultBadge.tsx                  — small "Default" pill, reused wherever an address renders
  ├── AddNewAddressRow.tsx                     — "+ Add new address" row, routes to address-picker flow
  ├── MiniMapPreview.tsx                       — static non-interactive map thumbnail, tap→full picker
  └── AddressSkeletonCard.tsx                  — shimmer placeholder matching AddressCard exact shape

src/components/booking/summary/
  ├── SummarySectionCard.tsx                   — generic card wrapper (icon+title+content), reused 4x below
  ├── SummaryWorkerRow.tsx                     — worker avatar+name+rating (uses SummarySectionCard)
  ├── SummaryServicesList.tsx                  — read-only service+price rows (uses SummarySectionCard)
  ├── SummaryScheduleRow.tsx                   — date+time+urgent-flag display (uses SummarySectionCard)
  ├── SummaryAddressRow.tsx                    — selected address display (uses SummarySectionCard)
  ├── AcceptanceWindowBanner.tsx                — "Worker has 30 min to accept" info banner
  └── DescriptionInput.tsx                     — optional collapsed "Add details" note field

src/components/booking/
  ├── BookingPriceSummary.tsx                  — container: stacks pricing rows + escrow note (reuses Day-21 primitives)
  └── BookingFooterCTA.tsx                     — NEW shared sticky footer, replaces Schedule's one-off footer too

src/hooks/
  ├── useAddresses.ts                          — NEW: fetch saved addresses list
  ├── useBookingEstimate.ts                    — NEW: wraps getEstimate() based on bookingDraft.store selections
  └── useCreateBooking.ts                      — NEW: wraps createBooking() mutation, exposes loading/error

src/services/api/
  └── booking.api.ts                           — getEstimate, createBooking, listBookings, getBooking,
                                                  acceptBooking, cancelBooking, confirmCompletion

src/store/
  └── bookingDraft.store.ts                    — existing, confirm addressId field added alongside date/time/isUrgent

RETROACTIVE CHANGE TO DAY 22:
  src/components/booking/schedule/ScheduleContinueFooter.tsx  → DELETED
  app/booking/schedule.tsx                     → now imports BookingFooterCTA instead
```

**Why this split matters (senior reasoning, not busywork):**
- **`BookingFooterCTA` is the single most important structural decision today.** Days 22/23/24 each end in a sticky primary-CTA footer with slightly different labels ("Next: Address →," "Confirm Booking," eventually "Pay Rs X" on Day 24) and slightly different enabled-conditions. Building three near-identical footer files across three days is exactly the kind of drift a senior review would flag — so today we extract one component (`label`, `enabled`, `loading`, `onPress` props) and **retroactively replace** Day 22's one-off footer with it. This is a normal, healthy refactor: you don't always see the shared shape until the second or third occurrence.
- `SummarySectionCard` is a generic wrapper (icon + title + arbitrary content slot) used by all four summary rows (Worker/Services/Schedule/Address) — this guarantees visual consistency (same padding, same card radius, same icon treatment) across sections that otherwise show completely different data shapes, without four separate styling implementations.
- `AddressDefaultBadge` is pulled out as its own tiny file because it will be reused later wherever an address is displayed elsewhere in the app (Profile → Saved Addresses list) — a one-line component is still worth its own file the moment it's used in more than one place.
- `useBookingEstimate` and `useCreateBooking` are separated from the raw `booking.api.ts` calls because the Summary screen needs *derived/managed* state (loading, error, cached estimate) — not raw promise calls scattered through the composition root.
- `MiniMapPreview` stays deliberately dumb/static — it is not `MapCanvas` from Day 20 reused, because it needs zero interactivity (no pins, no gestures, no camera control) — reusing the full interactive map component here would be over-engineering for what is just a visual affordance that routes elsewhere on tap.

---

## 3. Component-by-Component Detail

### 3.1 `app/booking/address.tsx` — Composition Root (Step 3)
**Responsibility:** Renders `AddressHeader` → `StepProgress` (reused from Day 22, `activeIndex=2`) → `AddressList` (or `AddressSkeletonCard × N` while `useAddresses` loads) → `AddNewAddressRow` → `MiniMapPreview` → `BookingFooterCTA`. Contains no address-fetching logic, no selection-state logic beyond passing `bookingDraft.store`'s `addressId` down.

### 3.2 `AddressHeader.tsx`
**Responsibility:** Title + back button only — same dumb-header pattern established on every prior screen (Cart, Schedule).

### 3.3 `AddressList.tsx`
**Responsibility:** `FlashList` of `AddressCard`s, owns the `selectedId` sync with `bookingDraft.store.addressId` (writes on card tap, reads to determine which card renders selected). This is the same "single sync bridge" pattern as `MapWorkerList` from Day 20 — exactly one place selection logic lives, not duplicated across cards and store.

### 3.4 `AddressCard.tsx`
**Responsibility:** Icon (home/office/other) + address line (Jakarta) + `AddressDefaultBadge` (if applicable) + radio-style selection indicator.
- **UX Law — Recognition over Recall (the defining law of this entire screen):** addresses render as pre-built, recognizable objects — "🏠 Home · 45 Main Blvd" — never a form the user retypes. The user recognizes *which* address is theirs instantly; they never have to recall or re-derive a street name from memory.
- **Microinteraction:** selection gets `border→2px green` with a quick spring-in (spring-default, ~200ms) + checkmark fade-in (100ms) — deliberately **calmer** than Day 22's bouncy calendar-date selection, because picking a saved, familiar address is a lower-stakes, more habitual action than picking a specific date, and the motion weight should match the decision weight.

### 3.5 `AddressDefaultBadge.tsx`
**Responsibility:** A small "Default" pill — reused as-is anywhere an address is displayed across the app (Profile → Saved Addresses, later). Static, no animation.

### 3.6 `AddNewAddressRow.tsx`
**Responsibility:** A single explicit row, "+ Add new address," routing to the existing address-picker flow.
- **UX Law — Hick's Law:** this is deliberately the **only** second path on the screen besides picking a saved card — no competing "paste address" text field, no "use current location" shortcut fighting for attention alongside it. Exactly two ways to proceed, both unambiguous.

### 3.7 `MiniMapPreview.tsx`
**Responsibility:** A static, non-interactive map thumbnail reflecting the currently-selected address's location. Tapping it navigates to the full address picker. No animation — kept visually calm on purpose so it doesn't compete with the actual decision surface above it (the address card list).

### 3.8 `AddressSkeletonCard.tsx`
**Responsibility:** Shimmer placeholder pixel-matched to `AddressCard`, shown while `useAddresses` fetches. Sibling-file discipline continued from Day 20/21/22 (skeleton always lives beside its real counterpart).

### 3.9 `app/booking/summary.tsx` — Composition Root (Step 4)
**Responsibility:** Renders `StepProgress` (`activeIndex=3`) → `SummaryWorkerRow` → `SummaryServicesList` → `SummaryScheduleRow` → `SummaryAddressRow` → `DescriptionInput` → `BookingPriceSummary` → `AcceptanceWindowBanner` → `BookingFooterCTA`. Wires `bookingDraft.store` (read-only here — nothing on this screen should mutate a prior step's selection directly; edits route back to the relevant step) and `useBookingEstimate`/`useCreateBooking`.
- **UX Law — Serial Position Effect (the defining law of this screen's information order):** Worker (who) → Services (what) → Schedule (when) → Address (where) → Price (how much) → Confirm. This mirrors how a person mentally double-checks a commitment: identity first, logistics in the middle, cost placed **immediately before** the action. Placing price right before the CTA is deliberate — the very last thing seen before committing is exactly what's being committed to, which measurably reduces post-booking regret and the support tickets that regret generates.

### 3.10 `SummarySectionCard.tsx` (generic, reused 4×)
**Responsibility:** A consistent card shell — icon + section title (Poppins) + a content slot for whatever the section needs to show. `SummaryWorkerRow`, `SummaryServicesList`, `SummaryScheduleRow`, and `SummaryAddressRow` all wrap themselves in this, guaranteeing identical padding/radius/icon treatment across four otherwise-very-different data shapes.

### 3.11 `SummaryWorkerRow.tsx`
**Responsibility:** Worker avatar + name (Poppins) + rating (Inter), read-only, no "Change" link here (that decision already happened and closed at the Cart step — Summary is read-only review by design, consistent with Cart's Hick's-Law philosophy from Day 21: don't reopen decisions that were already confirmed one step ago).

### 3.12 `SummaryServicesList.tsx`
**Responsibility:** Read-only list of service name + price rows (reuses `PriceSummaryRow`'s visual style from Day 21's Cart work for consistency, but without the interactive stepper — this is a *review*, not an edit surface).

### 3.13 `SummaryScheduleRow.tsx`
**Responsibility:** Displays selected date, time, and urgent-flag (if set) — all read from `bookingDraft.store`. Date/time rendered in Inter (they're data values).

### 3.14 `SummaryAddressRow.tsx`
**Responsibility:** Displays the selected address line + label icon, read from `bookingDraft.store.addressId` cross-referenced against `useAddresses`.

### 3.15 `DescriptionInput.tsx`
**Responsibility:** An optional, collapsed-by-default "Add details for the worker" field — same collapse-then-expand pattern as `CartNoteInput` from Day 21, reused deliberately for interaction consistency across the app rather than reinvented here.
- **UX Law — Hick's Law:** collapsed by default so an empty, always-visible text field doesn't silently pressure the user into deciding whether to fill it during a review step where their attention should be on confirming, not composing text.

### 3.16 `BookingPriceSummary.tsx`
**Responsibility:** A thin container reusing Day 21's `PriceSummaryRow` (×2: subtotal, platform fee) and `CartTotalRow` (renamed conceptually to a shared "TotalRow" primitive) + `EscrowNote`, fed by `useBookingEstimate` instead of `useCartTotals`. This is a deliberate reuse, not a rebuild — the exact same visual treatment for "the final number that matters" should appear identically on Cart and on Booking Summary, reinforcing one consistent mental model for "how Tasklync shows me a total."
- **Microinteraction:** identical Inter-Bold, count-up-on-mount treatment as Cart's total (`withTiming` ease-out, 400–600ms) — **visual consistency across every screen that shows a final number** is the whole point.

### 3.17 `AcceptanceWindowBanner.tsx`
**Responsibility:** "Worker has 30 min to accept your booking" — a single static info banner (info-blue tint, Jakarta text).
- **UX Law — Doherty Threshold / anxiety reduction:** this line sets an honest, immediate expectation *before* commitment. Its entire job is preventing a much worse anxiety moment later — a user staring at a "Pending" status with no idea how long is normal to wait. One sentence here removes an entire category of future support tickets.

### 3.18 `BookingFooterCTA.tsx` (NEW shared primitive, replaces 3 near-duplicates)
**Responsibility:** A single sticky-footer component accepting `label` (string), `enabled` (bool), `loading` (bool), and `onPress`. Used by Schedule (Day 22, retrofitted), Address (today, "Next: Review →"), and Summary (today, "Confirm Booking").
- **Microinteraction:** identical press-spec every time it's used (scale 0.97 in / 1.02→1.0 spring-bouncy out + medium haptic when enabled; muted + zero feedback when disabled) — the whole value of extracting this component is that the *feel* of "the next step button" is now guaranteed identical everywhere in the funnel, rather than three separately-tuned approximations of the same thing.
- **On Summary specifically:** press → loading (width locked) → on success, **immediately** navigates to Payment with **no success flash**. The actual celebratory moment is deliberately reserved for Day 24's Booking Success screen *after* payment — firing two "success" feelings back-to-back (Confirm succeeding, then Payment succeeding) would dilute both; only one of them should carry the emotional weight.

### 3.19 `useAddresses.ts` (hook)
**Responsibility:** Fetches the user's saved addresses list. No JSX. Consumed by `AddressList` and by `SummaryAddressRow` (to resolve the selected `addressId` into a display line) — one fetch/cache, two consumers.

### 3.20 `useBookingEstimate.ts` (hook)
**Responsibility:** Given the current `bookingDraft.store` contents (services, schedule, urgent flag), calls `getEstimate()` and returns `{ subtotal, platformFee, total, isLoading }`. `BookingPriceSummary` consumes this exactly the way `CartSummary` consumed `useCartTotals` on Day 21 — same shape, different data source, deliberate architectural echo.

### 3.21 `useCreateBooking.ts` (hook)
**Responsibility:** Wraps `createBooking()`, exposing `{ submit, isLoading, error }`. `BookingFooterCTA`'s `onPress` on the Summary screen calls `submit()` and reacts to its `isLoading` to drive the loading state — the composition root (`summary.tsx`) never touches the raw API call directly.

---

## 4. UX Laws Applied — Full Detail (Day 23)

| Law | Where on this screen | Why it's the correct tool here |
|---|---|---|
| **Recognition over Recall** | `AddressCard` (pre-built recognizable objects, never a re-entry form) | Users recognize "which address is mine" instantly from a familiar card; recall (typing it again) is strictly worse and error-prone. |
| **Hick's Law** | `AddNewAddressRow` (exactly 2 paths on Address screen), `DescriptionInput` (collapsed by default) | Fewer visible competing choices = faster, more confident decisions, especially on a screen whose whole job is confirmation, not exploration. |
| **Serial Position Effect** | Summary screen's fixed section order: Worker → Services → Schedule → Address → Price → Confirm | Mirrors natural human double-checking order; placing price immediately before the CTA maximizes transparency at the exact moment it matters most. |
| **Goal-Gradient Effect** | `StepProgress` at `activeIndex=3` (4/4 visually "almost there") | The visibly-near-complete progress bar makes tapping Confirm feel like the natural conclusion of momentum already built, not a fresh decision requiring new willpower. |
| **Doherty Threshold** | `AcceptanceWindowBanner` setting an explicit wait-time expectation | Removing ambiguity about "how long is normal" preempts anxiety and support tickets that would otherwise surface much later, at a worse moment. |
| **Consistency (design-system principle, not a named cognitive law but equally load-bearing)** | `BookingFooterCTA` shared across 3 screens, `BookingPriceSummary` reusing Cart's total treatment | A user should never have to re-learn what "the primary action" or "the final number" looks like as they move through a multi-step funnel — sameness here is a feature, not laziness. |

---

## 5. Microinteraction Summary Table

| Element | Trigger | Motion | Duration/Config | Haptic |
|---|---|---|---|---|
| AddressCard select | tap card | border→green spring-in + checkmark fade | spring-default ~200ms / 100ms fade | light |
| AddNewAddressRow | tap | standard row press-state only | — | none |
| MiniMapPreview | tap | none (navigates) | — | none |
| Summary sections entrance | screen mount | grouped fade/slide, one motion | spring-default, ~250ms | none |
| BookingPriceSummary total | mount / estimate resolves | count-up | withTiming ease-out, 400–600ms | none |
| DescriptionInput expand | tap "+ Add details" | height 0→auto | spring-default, ~200ms | none |
| BookingFooterCTA (enabled) | tap | scale 0.97 in / 1.02→1.0 out | spring-stiff in / spring-bouncy out | medium |
| BookingFooterCTA (disabled) | tap | none | — | none |
| BookingFooterCTA on Summary success | createBooking resolves | none (immediate nav, no flash) | — | none |

---

## 6. Definition of Done (Day 23)

- [ ] `app/booking/address.tsx` and `app/booking/summary.tsx` contain composition/layout only — no address-fetch logic, no price-calculation logic, no raw API calls inline.
- [ ] `AddressCard` correctly shows the default badge when applicable and reflects selection state from `bookingDraft.store.addressId`.
- [ ] `AddNewAddressRow` routes to the existing address-picker flow and, on return, the newly-added address appears selectable in `AddressList`.
- [ ] Summary screen's section order is fixed as Worker → Services → Schedule → Address → Price → Confirm, with zero conditional reordering.
- [ ] `BookingPriceSummary` accurately reflects `getEstimate()`'s response via `useBookingEstimate`, with the same count-up treatment as Cart's total.
- [ ] `BookingFooterCTA` is verified reused (not duplicated) across Schedule, Address, and Summary — Day 22's one-off footer file is deleted.
- [ ] Confirm Booking calls `createBooking()` via `useCreateBooking`, and on success navigates directly to Payment with no intermediate success animation.
- [ ] Back-navigation from Summary → Address → Schedule preserves every prior selection (verified by navigating backward and confirming all fields are intact).
- [ ] `AcceptanceWindowBanner` renders on Summary with the correct static copy.
- [ ] Fonts verified: Poppins on titles/section headers/worker name, Inter on every price/date/time value, Jakarta on address lines/description input/banner copy — no mixing.

---

## 7. Why this breakdown is the "industry-level" choice

A junior implementation would build a new one-off footer for Address, another new one-off footer for Summary, and a from-scratch price-summary component for Summary that duplicates Cart's total-row styling by hand. That triples the maintenance surface for something that should look and feel identical everywhere. The breakdown above guarantees:

1. **Convergent design language** — `BookingFooterCTA` and the reused pricing-row primitives mean the funnel feels like *one continuous experience* rather than three screens built by three different moods.
2. **Retroactive simplification is treated as normal engineering, not a mistake** — deleting Day 22's one-off footer the moment a shared shape becomes obvious is exactly how senior codebases stay small over time, instead of accumulating near-duplicates that each get patched independently later.
3. **Clear data/UI separation** — `useAddresses`, `useBookingEstimate`, and `useCreateBooking` are all pure logic hooks; every visual component downstream just renders props, making the whole flow easy to reason about and to swap mock data for real API responses without touching a single component file.
4. **Screen composability for future variants** — if Tasklync later needs an "edit existing booking" flow, `SummarySectionCard` + the summary row components are already the exact building blocks needed, with no rework.
