# 🛒 Tasklync — Day 21 (Expanded) — Cart Screen
### Confirmation Layer, Not a Decision Layer · Fully Componentized · Zero Code, Full Implementation Spec

> Senior engineering principle applied here: **one component = one responsibility.**
> `app/cart/index.tsx` should end up being mostly *composition* — importing and arranging components — not logic, not inline swipe-gesture code, not inline price math. Anything with its own state, its own animation, or its own visual identity gets its own file. This makes `SwipeToDeleteRow` reusable on the Notifications screen (Day 32 in the 60-day doc), `QuantityStepper` reusable anywhere a count needs incrementing, and the whole screen trivially testable piece by piece.

**Fonts (locked, no exceptions):**
- **Poppins** → "Cart" header title, worker name in `CartWorkerCard`, "Proceed to Booking" CTA label
- **Plus Jakarta Sans** → service names, "Change" link, note input placeholder, empty-state copy, escrow helper text
- **Inter** → every price (subtotal, platform fee, total), quantity numbers, review count on worker card

---

## 1. Objective

Build a cart that is deliberately **boring by design** — a pure confirmation surface where every choice was already made upstream. Zero new decisions get introduced here. Achieve this with **17 small composable files** instead of 3 large ones, so the screen is scannable, reusable, and safe to extend later without becoming a monolith.

---

## 2. Full File/Folder Breakdown

```
app/
  cart/
    index.tsx                                — COMPOSITION ONLY: assembles everything below

src/components/cart/
  ├── CartHeader.tsx                          — "Cart" title + item-count badge + back button
  ├── CartWorkerCard.tsx                      — selected worker avatar+name+rating + "Change" link
  ├── CartItemList.tsx                        — FlashList wrapper, owns item ordering/keys
  ├── CartItem.tsx                            — single row: service name + price + stepper + delete
  ├── QuantityStepper.tsx                     — reusable [-] [qty] [+] control (generic, not cart-only)
  ├── SwipeToDeleteRow.tsx                    — reusable swipe-gesture wrapper (generic, wraps CartItem)
  ├── AddMoreServicesLink.tsx                 — "+ Add more services" row, routes back to category
  ├── CartNoteInput.tsx                       — optional "Note for worker" collapsed-by-default field
  ├── CartSummary.tsx                         — container: stacks the 3 rows below + escrow note
  ├── PriceSummaryRow.tsx                     — reusable single row (label + Inter value), used 2x
  ├── CartTotalRow.tsx                        — the bold/large/green total row, visually distinct from PriceSummaryRow
  ├── EscrowNote.tsx                          — "Paid after job is done" helper line
  ├── ProceedFooter.tsx                       — sticky footer CTA, disabled-state aware
  ├── WorkerConflictModal.tsx                 — "Start a new cart?" confirmation when adding a 2nd worker's service
  └── CartSkeletonItem.tsx                    — shimmer placeholder matching CartItem exact shape

src/components/feedback/EmptyState/
  └── EmptyCart.tsx                           — illustration + "Browse Services" secondary CTA

src/components/cart/ (existing, verify only)
  └── AddToCartButton.tsx                     — built Day 14, verify wiring against cart.store here

src/hooks/
  ├── useCartTotals.ts                        — NEW: derives subtotal/fee/total from cart.store items
  └── useCartValidation.ts                    — NEW: single-worker-rule check, returns conflict info

src/store/
  └── cart.store.ts                           — existing (Day 14), confirm single-worker enforcement lives here
```

**Why this split matters (senior reasoning, not busywork):**
- `QuantityStepper` and `SwipeToDeleteRow` are written as **generic, cart-agnostic** components. `QuantityStepper` will get reused wherever a count needs adjusting (e.g., a future "duration hours" picker); `SwipeToDeleteRow` is a wrapper that accepts *any* child row and gesture-reveals a delete action behind it — reusable on Notifications (Day 32) and Saved Addresses lists without rewriting swipe physics twice.
- `PriceSummaryRow` vs `CartTotalRow` are deliberately **two different files**, not one component with an `isTotal` prop. The total row has different font weight, size, and color treatment (Von Restorff Effect — it must look categorically different, not just "the same row but bigger"), so giving it its own file prevents future edits to one accidentally bleeding into the other.
- `useCartTotals` and `useCartValidation` are pure logic hooks with zero JSX — this means the price math and the single-worker rule can be unit-tested without rendering a single component.
- `CartItem` never contains its own swipe logic — `SwipeToDeleteRow` wraps it. This means `CartItem` stays a "dumb" presentational row, and the swipe mechanics can be changed/upgraded once, in one file, and every row that uses it benefits automatically.
- `CartSkeletonItem` lives as a sibling to `CartItem` specifically so any future edit to the real row's layout is immediately comparable side-by-side with its skeleton twin in code review — preventing shape drift.

---

## 3. Component-by-Component Detail

### 3.1 `app/cart/index.tsx` — Composition Root
**Responsibility:** Layout only. Renders `CartHeader` → `CartWorkerCard` → `CartItemList` (or `EmptyCart` if empty) → `AddMoreServicesLink` → `CartNoteInput` → `CartSummary` → `ProceedFooter` (sticky). Reads `cart.store`, `useCartTotals`, `useCartValidation`. Contains no price math, no gesture code, no modal logic beyond triggering `WorkerConflictModal` when `useCartValidation` reports a conflict.

### 3.2 `CartHeader.tsx`
**Responsibility:** "Cart" title (Poppins SemiBold) + item-count badge (Inter, small pill) + back button. Static, no animation beyond the standard back-button press-scale — a header shouldn't compete for attention on a confirmation screen.

### 3.3 `CartWorkerCard.tsx`
**Responsibility:** Displays the selected worker (avatar, name — Poppins, rating — Inter) with a "Change" text link on the right.
- **UX Law — Recognition over Recall:** the user *recognizes* who they picked at a glance; they never have to recall from memory or navigate backward to confirm.
- **Microinteraction:** "Change" tap has no special animation beyond standard link press-state — it's a low-frequency escape hatch, not a primary action, so it earns zero extra motion budget.

### 3.4 `CartItemList.tsx`
**Responsibility:** `FlashList` wrapper around the array of cart items. Owns stable `keyExtractor` (service ID, not array index — critical so `SwipeToDeleteRow`'s collapse animation targets the correct row even after reordering). Renders `CartSkeletonItem` × N while the initial cart hydration from MMKV is in flight, and `CartItem` (wrapped in `SwipeToDeleteRow`) once loaded.

### 3.5 `CartItem.tsx`
**Responsibility:** A single presentational row — service name (Jakarta), price (Inter), and a slot for `QuantityStepper`. Contains **zero gesture logic** — it is rendered *inside* `SwipeToDeleteRow`, not aware that swiping exists.

### 3.6 `QuantityStepper.tsx` (generic, reusable)
**Responsibility:** `[-] [qty] [+]` control. Accepts `value`, `onIncrement`, `onDecrement`, `min`.
- **Microinteraction:** each button tap → `scale 1→0.9→1` (spring-stiff, 150ms) + light haptic. The quantity number itself pulses `scale 1→1.15→1` (spring-bouncy) on every change — this is deliberately on the *number*, not the buttons, so the eye catches the actual updated value even inside a long scrolling list where the buttons themselves may already be out of the user's foveal focus.
- **UX Law — Doherty Threshold:** the store updates and the number re-renders in the exact same frame as the tap — zero perceived latency, because this is a local Zustand mutation, not a network call.

### 3.7 `SwipeToDeleteRow.tsx` (generic, reusable)
**Responsibility:** A gesture wrapper — accepts any child, reveals a red background + trash icon proportionally to swipe distance (1:1 gesture-driven, not animation-duration-driven), and on release past a threshold, collapses the wrapped row's height to `0` (spring-gentle, ~250ms) before calling an `onDelete` callback.
- **UX Law — Jakob's Law:** this is the exact iOS Mail/Messages swipe-to-delete pattern. No confirmation dialog is stacked on top of it — a dialog on top of a swipe the user already committed to would contradict the gesture's implicit "I already decided" contract and feel redundant/annoying.
- **Haptic rule:** medium haptic fires on the *delete commit* (release past threshold), never during the drag itself — the haptic marks the decision, not the motion.

### 3.8 `AddMoreServicesLink.tsx`
**Responsibility:** A single row, "+ Add more services," routing back to the category/service browse flow for the currently selected worker. No animation beyond standard press-state — Hick's Law reasoning: this is the *only* additional action offered on the whole screen besides modifying existing items, deliberately kept to one clearly-labeled row rather than a menu of options.

### 3.9 `CartNoteInput.tsx`
**Responsibility:** An optional multi-line note field, **collapsed by default** behind a "+ Add a note for the worker" tap target, expanding into a text input only when tapped.
- **UX Law — Hick's Law:** an always-visible empty text field on a confirmation screen silently pressures the user into deciding whether to fill it; collapsing it removes that ambient decision entirely until the user explicitly opts in.
- **Microinteraction:** expand is a height animation (`0→auto`, spring-default, ~200ms), not a hard cut — so the layout shift below it (summary, footer) doesn't jump abruptly.

### 3.10 `CartSummary.tsx`
**Responsibility:** A layout container only — stacks `PriceSummaryRow` (×2: subtotal, platform fee) → `CartTotalRow` → `EscrowNote`, inside a card with `shadow-sm`. Holds no price logic itself; reads the already-computed values from `useCartTotals`.

### 3.11 `PriceSummaryRow.tsx` (reusable, used twice)
**Responsibility:** One row — label (Jakarta, muted) + value (Inter, regular weight). Used for "Subtotal" and "Platform fee." Deliberately neutral-styled so neither of these two competes visually with the total below.

### 3.12 `CartTotalRow.tsx`
**Responsibility:** The final total — Inter **Bold**, larger size, green-accented text. A separate file from `PriceSummaryRow` on purpose.
- **UX Law — Von Restorff Effect:** this is the *only* large, bold, green-accented number on the entire screen — every other row is small and neutral, so the eye is guaranteed to land on the one number that actually matters for the decision to proceed.
- **Microinteraction:** count-up animation via `withTiming` + ease-out (**never spring** — money should feel *computed*, not bouncy), ~400–600ms depending on the size of the delta, triggered whenever `useCartTotals` recalculates.

### 3.13 `EscrowNote.tsx`
**Responsibility:** "Paid after job is done" — Jakarta Regular, muted, small, sitting directly under the total. Static text, no animation. This single line is a **loss-aversion / trust** device: it removes the user's implicit fear of "am I paying right now?" at the exact moment their eyes are on the total.

### 3.14 `ProceedFooter.tsx`
**Responsibility:** The sticky bottom CTA. Reads `useCartValidation`/cart-item-count to determine enabled/disabled state.
- **Microinteraction (enabled):** standard primary-button press spec (scale 0.97 in / 1.02→1.0 spring-bouncy out) + medium haptic.
- **Microinteraction (disabled):** muted color, **zero press feedback** — silence is the correct signal here (matches the Day-3 disabled-button rule: pressing something disabled should confirm nothing is happening, not almost-animate).
- **UX Law — Fitts's Law:** full-width, 52px height, permanently visible above the safe area — the single most important tap target on the screen never requires a scroll to reach.

### 3.15 `WorkerConflictModal.tsx`
**Responsibility:** Triggered by `useCartValidation` when the user attempts to add a service from a *different* worker than the one already in the cart. Presents two clear options: "Start new cart" (clears existing items, adds the new one) or "Cancel" (keeps current cart, discards the new add).
- **UX Law — Hick's Law:** exactly two options, both explicitly labeled with their consequence — no ambiguous "OK/Cancel" that leaves the user guessing which one keeps their existing cart.
- **Microinteraction:** standard modal entrance (`scale 0.9→1 + opacity 0→1`, spring-default) + backdrop fade — this is a *decision* moment, so it earns a deliberate, unhurried entrance rather than a snap-in.

### 3.16 `EmptyCart.tsx`
**Responsibility:** Illustration + "Your cart is empty" (Poppins) + "Add services to get started" (Jakarta) + "Browse Services" **secondary** (outline, not primary green) button.
- **UX Law — Hick's Law:** secondary button, not primary — an empty state is informational, not a conversion moment, so it shouldn't visually compete with real conversion CTAs elsewhere in the app.
- **Microinteraction:** illustration + text + CTA fade/slide in together as **one grouped motion** (spring-default, ~250ms) — not staggered. Three elements staggering would read as fussy rather than considered; group motion here reads as calm and intentional.

### 3.17 `CartSkeletonItem.tsx`
**Responsibility:** Shimmer placeholder, pixel-matched to `CartItem`'s exact shape (icon block, two text lines, stepper-shaped block on the right) — shown briefly while cart items hydrate from MMKV on cold start.
- **UX Law — Doherty Threshold + Recognition over Recall applied to loading:** the user recognizes "that's where my item will be" before the real data even renders, so the transition from skeleton to real content produces zero layout jump and zero feeling of a "loading delay."

### 3.18 `useCartTotals.ts` (hook)
**Responsibility:** Pure derivation — reads `cart.store.items`, returns `{ subtotal, platformFee, total }`. No JSX, no side effects. `CartSummary`, `PriceSummaryRow` ×2, and `CartTotalRow` all consume this same hook so there is exactly one place the math can ever be wrong, not four.

### 3.19 `useCartValidation.ts` (hook)
**Responsibility:** Given an incoming "add to cart" attempt, checks it against `cart.store`'s current `workerId`. Returns `{ hasConflict, incomingItem }`. `AddToCartButton` (existing, Day 14) calls this before writing to the store; if `hasConflict` is true, `WorkerConflictModal` is shown instead of a silent overwrite.

---

## 4. UX Laws Applied — Full Detail (Day 21)

| Law | Where on this screen | Why it's the correct tool here |
|---|---|---|
| **Hick's Law** | Whole-screen principle: zero upsells/alternates; `AddMoreServicesLink` is the only extra action; `CartNoteInput` collapsed by default; `WorkerConflictModal` has exactly 2 clearly-labeled options; `EmptyCart` CTA is secondary, not primary | Every additional visible choice on a confirmation screen slows the user down and increases abandonment risk. This screen's entire design philosophy is removing decisions, not adding them. |
| **Recognition over Recall** | `CartWorkerCard` shows the full selected worker, not just an ID or a "worker selected" label | The user shouldn't have to remember or go back and check who they picked — it's shown, fully, right at the top. |
| **Jakob's Law** | `SwipeToDeleteRow` — exact iOS Mail/Messages pattern | Millions of users already have this exact gesture memorized; reusing it means zero learning curve and instantly-correct expectations (including that no confirmation dialog follows). |
| **Doherty Threshold** | `QuantityStepper` same-frame updates, `CartSkeletonItem` matching shape during hydration | Every action must feel instant; local state changes have no excuse to feel slow, and loading states should look like "the content is arriving," not "something is broken." |
| **Von Restorff Effect** | `CartTotalRow` — the only bold/large/green number on the screen | The one number the decision hinges on must be visually unmistakable among several other, deliberately duller, numbers. |
| **Fitts's Law** | `ProceedFooter` — full-width, 52px, permanently sticky above safe area | The single most important action on the screen must never require a scroll or a precise tap to reach. |

---

## 5. Microinteraction Summary Table

| Element | Trigger | Motion | Duration/Config | Haptic |
|---|---|---|---|---|
| QuantityStepper button | tap +/- | scale 1→0.9→1 | spring-stiff, 150ms | light |
| QuantityStepper number | value change | scale 1→1.15→1 | spring-bouncy | none |
| SwipeToDeleteRow reveal | drag | reveal proportional to translation | gesture-driven (1:1) | none |
| SwipeToDeleteRow collapse | release past threshold | height →0 | spring-gentle, ~250ms | medium (on commit) |
| CartNoteInput expand | tap "+ Add note" | height 0→auto | spring-default, ~200ms | none |
| CartTotalRow value change | subtotal recalculates | count-up | withTiming ease-out, 400–600ms | none |
| WorkerConflictModal open | 2nd-worker add attempt | scale 0.9→1, opacity 0→1 | spring-default | none |
| EmptyCart entrance | cart becomes empty | grouped fade/slide (1 motion) | spring-default, 250ms | none |
| ProceedFooter (enabled) press | tap | scale 0.97 in / 1.02→1.0 out | spring-stiff in / spring-bouncy out | medium |
| ProceedFooter (disabled) press | tap | none | — | none |
| "Change worker" link | tap | standard link press-state only | — | none |

---

## 6. Definition of Done (Day 21)

- [ ] `app/cart/index.tsx` contains composition/layout only — no inline price math, no inline gesture code, no inline modal-trigger logic beyond calling the hook results.
- [ ] Every listed component exists as its own file with a single clear responsibility.
- [ ] `useCartTotals` is the *only* place subtotal/fee/total are computed — verified by confirming `PriceSummaryRow` and `CartTotalRow` receive values as props, never compute their own.
- [ ] `SwipeToDeleteRow` is generic enough to wrap `CartItem` without any cart-specific code inside the wrapper itself.
- [ ] Adding a service from a different worker triggers `WorkerConflictModal` — never a silent overwrite.
- [ ] `CartSkeletonItem` and `CartItem` are pixel-matched (measured side by side, zero layout shift on hydration).
- [ ] `CartNoteInput` starts collapsed and expands smoothly without shifting `CartSummary`/`ProceedFooter` abruptly.
- [ ] `ProceedFooter` is disabled (with zero press feedback) when the cart is empty, and enabled the instant an item exists.
- [ ] `EmptyCart` renders correctly when the cart is cleared to zero items, with a secondary (not primary) CTA.
- [ ] Fonts verified: Poppins on titles/worker name/CTA labels, Inter on every price/quantity/rating number, Jakarta on everything else — no mixing.

---

## 7. Why this breakdown is the "industry-level" choice

A junior implementation would put the header, worker card, item list, swipe logic, and price math all inside `cart/index.tsx` — functional, but every future change (reusing swipe-to-delete elsewhere, adjusting the price formula, restyling just the total row) would mean editing one large, tangled file. The breakdown above guarantees:

1. **Reusability** — `SwipeToDeleteRow` and `QuantityStepper` are cart-agnostic and drop directly into Notifications, Saved Addresses, or any future counted-item UI with zero rewrite.
2. **Testability** — `useCartTotals` and `useCartValidation` are pure hooks; the price math and the single-worker rule can be unit-tested with plain data, no rendering required.
3. **Safe extension** — adding a promo-code row later means adding one new `PriceSummaryRow` usage inside `CartSummary`, not restructuring the screen.
4. **Design-system compounding** — the swipe-wrapper and skeleton pattern built today are permanent tools available to every list-based screen for the rest of the build.
