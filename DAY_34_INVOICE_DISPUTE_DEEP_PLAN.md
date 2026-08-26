# 🧾 DAY 34 — Invoice & Dispute Screens
### Deep Implementation Plan · Principal React Native Engineer Level
> Scope: Post-booking financial screens for Tasklync User App (Expo SDK 52, Expo Router, Zustand, TanStack Query, Reanimated 3, expo-image-picker)
> Two screens, two very different emotional registers, built on the same day because they share underlying booking data and the same "financial trust" component family. Invoice = **read, don't touch**. Dispute = **guided conflict resolution**. Cancel Modal = **a shared destructive-action pattern** used by both.

---

## 0. Why This Day Is Architected the Way It Is

Invoice and Dispute look like "just two more screens," but together they're **five distinct trust-engineering problems**, each of which fails silently (looks fine in a demo, breaks under real conditions) if not treated deliberately:

1. **The invoice must render identically whether the data source is JSON or a signed PDF URL.** The endpoint (`GET /bookings/:id/invoice`) is documented as returning "invoice data **or** signed PDF URL" — this is an either/or contract the client must handle gracefully, not assume one shape.
2. **The refund policy shown to the user must be computed by the exact same rule the backend will actually apply.** If the client hardcodes its own copy of the refund percentage table and the backend's cancellation policy logic ever changes, the two silently drift — a user could see "90% refund" in the modal and receive 50% on their statement. This is a trust-breaking bug class, not a cosmetic one.
3. **Evidence upload is three independent async state machines running in parallel**, not one. Each of the 3 photo slots can be idle/picking/uploading/success/error independently — a naive single `isUploading` boolean for the whole component cannot represent "slot 2 failed while slot 1 and 3 succeeded."
4. **Dispute submission depends on evidence upload completing first**, but evidence upload is optional — the submit flow must correctly handle "0 photos, submit immediately," "3 photos, all done, submit," and "2 photos done, 1 still uploading, what does Submit do" without the user ever wondering if their evidence actually attached.
5. **Two destructive actions (Cancel, Dispute) on the same day must share one confirmation pattern**, not two slightly different ones — inconsistency between how "are you sure you want to cancel" and "are you sure you want to submit this dispute" behave would undermine the calm, consistent tone this day is explicitly designed around.

Everything below is structured to solve these five once, with shared, reusable pieces — not duplicated per screen.

---

## 1. Complete File Tree for the Day

```
app/
  └── booking/
      └── [id]/
          ├── invoice.tsx                    # SCREEN: Invoice / Receipt
          └── dispute.tsx                    # SCREEN: Raise Dispute

src/
  ├── components/
  │   └── booking/
  │       ├── InvoiceHeader.tsx              # NEW — brand header + invoice number + date
  │       ├── InvoiceLineItem.tsx            # single service row: name + price
  │       ├── InvoiceFeeBreakdown.tsx        # subtotal / platform fee / total block
  │       ├── PaymentMethodRow.tsx           # NEW — masked card / payment status row, reusable
  │       ├── DisputeInfoBanner.tsx          # NEW — calm expectation-setting banner (extracted, reusable)
  │       ├── DisputeReasonRadioGroup.tsx    # 5 fixed reason options
  │       ├── DisputeEvidenceUpload.tsx      # 3-slot grid, owns layout only
  │       ├── DisputeEvidenceSlot.tsx        # NEW — single slot's own upload state machine
  │       ├── BookingCancelModal.tsx         # bottom sheet: cancel confirm + refund policy
  │       └── RefundPolicyNotice.tsx         # NEW — isolated dynamic refund-% display
  │
  ├── hooks/
  │   ├── useInvoice.ts                      # getInvoice(bookingId)
  │   ├── useDispute.ts                      # openDispute(), getDispute(), respondToDispute()
  │   ├── useEvidenceUpload.ts               # NEW — manages 3 independent slot upload state machines
  │   └── useCancelBooking.ts                # NEW — cancel mutation + refund calc, separate from dispute
  │
  ├── utils/
  │   └── refundPolicy.ts                    # NEW — pure function: booking timing/status → refund %
  │
  ├── services/api/
  │   └── booking.api.ts                     # (additions) getInvoice(), openDispute(), respondToDispute(), cancelBooking()
  │
  └── types/
      └── booking.types.ts                   # (touched) InvoiceData, DisputeReason, DisputePayload, RefundPolicyResult
```

**5 files added beyond the original list** — `InvoiceHeader.tsx`, `PaymentMethodRow.tsx`, `DisputeInfoBanner.tsx`, `DisputeEvidenceSlot.tsx`, `RefundPolicyNotice.tsx`, plus two new hooks and a pure utility (`useEvidenceUpload.ts`, `useCancelBooking.ts`, `refundPolicy.ts`) — each exists to isolate one of the five hard problems above so it's independently correct and independently testable.

---

## 2. `src/types/booking.types.ts` (extended — build/confirm first)

**Responsibility:** Extend the existing booking types file with the shapes this day needs:

- `InvoiceData` — modeled as a **discriminated union**: `{ kind: 'structured', lineItems, feeBreakdown, paymentMethod, ... } | { kind: 'pdf', url: string }`. This directly encodes hard problem #1 into the type system — any component consuming invoice data is forced by TypeScript to handle both branches, rather than the team discovering in QA that the PDF-URL case was never handled because the API contract's "or" was missed during implementation.
- `DisputeReason` — a fixed union of exactly 5 string literals (`'work_not_completed' | 'poor_quality' | 'worker_no_show' | 'overcharged' | 'other'`), not a free-form string — this is what makes Hick's Law's "exactly 5 options" an enforced constraint at the type level, not just a UI convention that could quietly grow a 6th option later without anyone noticing it violates the original design decision.
- `RefundPolicyResult` — `{ percentage: number, label: string, reason: string }`, the output shape of `refundPolicy.ts` (section 5) — a small but deliberate type so the pure function's output is structured data the UI can render consistently, not a pre-formatted string baked into the calculation logic (formatting belongs in the component, not the utility).

---

## 3. `src/services/api/booking.api.ts` (additions)

**Responsibility:** Thin HTTP layer additions, consistent with the rest of the codebase.

**Functions:**
- `getInvoice(bookingId)` → `GET /bookings/:id/invoice`
- `openDispute(bookingId, payload)` → `POST /bookings/:id/dispute`
- `getDispute(bookingId)` → `GET /bookings/:id/dispute`
- `respondToDispute(bookingId, response)` → `POST /bookings/:id/dispute/respond`
- `cancelBooking(bookingId, reason)` → `PATCH /bookings/:id/cancel`

**One contract question worth resolving before building, not after:** `getInvoice`'s response shape (structured JSON vs. signed PDF URL) — confirm with backend **which bookings return which shape** (e.g. always PDF once payment is fully settled, JSON for in-progress/pending states?) so `InvoiceData`'s discriminated union in section 2 is modeled against the actual real-world split, not a guess. This is the same category of "confirm before building" flag raised on Days 32/33 for undocumented endpoint behavior — cheap to resolve now, expensive to discover mid-build.

---

## 4. `src/hooks/useInvoice.ts`

**Responsibility:** Simple `useQuery` wrapping `getInvoice(bookingId)`, keyed `['booking', bookingId, 'invoice']`.

**Why this stays deliberately thin:** Unlike the dispute/evidence hooks below, invoice is pure read — no mutations, no optimistic updates, no complex state machine. Resisting the urge to add caching cleverness here (e.g. a long `staleTime` makes sense since a settled invoice never changes) is the correct amount of engineering for a read-only financial document — over-building this hook would just be premature complexity for a problem that doesn't exist on the read side.

**Cache tuning:** `staleTime: Infinity` (or a very long value) is justified here specifically — once a booking is completed and paid, its invoice is immutable. Treating it as effectively static data (rather than re-fetching on every screen focus) is both a performance win and semantically correct, unlike most of the app's other queries which genuinely do need freshness.

---

## 5. `src/utils/refundPolicy.ts`

**Responsibility:** The file that solves hard problem #2 — a **pure function**, `computeRefundPolicy(booking): RefundPolicyResult`, taking the booking's `status` and `scheduledAt`/`startedAt` timestamps and returning the percentage + label, mirroring the exact policy table documented in `LOW_LEVEL_ARCHITECTURE.md`'s Payment Service section (before accept: 100%, after accept before start >24h: 90%, after accept before start <24h: 50%, after start: 0%/dispute-only).

**Why this must be a pure, isolated, unit-tested function and not inline logic inside `BookingCancelModal.tsx`:**
- It is **the single place** in the client codebase where this policy table exists — if `BookingCancelModal` needs it, and a future "cancellation summary" screen also needs it, both import this same function, guaranteeing they never disagree.
- It is trivially unit-testable with fixed timestamp fixtures ("booking scheduled 25 hours from now, accepted → expect 90%", "booking scheduled 10 hours from now → expect 50%", "booking status IN_PROGRESS → expect 0%, dispute-only messaging") — this is exactly the kind of business-rule logic that deserves a real test suite, since a bug here has direct financial/trust consequences, unlike a bug in, say, an entrance animation.

**The deeper architectural note worth stating explicitly:** ideally this policy is **also exposed by a backend endpoint** (e.g. `GET /bookings/:id/cancellation-policy` returning the authoritative percentage) rather than purely recomputed client-side from a hardcoded copy of the table — recomputing client-side is a reasonable **Day 34 pragmatic choice** given no such endpoint currently exists in `ALL_API_ENDPOINTS.md`, but it's flagged here as a known drift risk worth raising with backend as a fast-follow, not treated as a permanently acceptable architecture. The client-side `refundPolicy.ts` should be written so that swapping its internals for a server call later doesn't change any calling component's code — it should return the same `RefundPolicyResult` shape either way.

---

## 6. `src/components/booking/InvoiceHeader.tsx`

**Responsibility:** Brand header block — "TASKLYNC" wordmark, invoice number, date. Static, presentational, receives the invoice's metadata as props.

**Why extracted from the screen file:** This exact header treatment (brand mark + reference number + date) is the kind of block that's highly likely to be reused if the app ever adds a "receipts history" list or a payment-methods-detail screen — building it as a standalone component from the start costs nothing extra today and avoids a copy-paste duplication later.

**Aesthetic-Usability Effect, concretely:** Generous vertical spacing around the brand mark, Poppins for the wordmark, Inter for the invoice number (it's a reference code — a measured/generated value, not authored text, so it follows the numbers-and-codes-use-Inter rule) — the goal is that this header alone, before the user reads a single line item, should already read as "official document," not "app screen."

---

## 7. `src/components/booking/InvoiceLineItem.tsx`

**Responsibility:** One row — service name (Jakarta Regular) + price (Inter, right-aligned). Purely presentational, no logic.

**Serial Position Effect, concretely:** Rendered in the **exact order services were added to the original booking** (the array order from the booking record, not re-sorted alphabetically or by price) — this matters because the user's mental model of "what did I book" was formed at booking-creation time in that order; re-sorting on the invoice would create a subtle mismatch between what they remember choosing and what they're now reviewing, undermining the "this matches what I did" trust signal the whole screen exists to provide.

---

## 8. `src/components/booking/InvoiceFeeBreakdown.tsx`

**Responsibility:** Subtotal / platform fee / total block — three rows, the last (Total) visually distinct.

**Serial Position Effect, concretely (the total specifically):** Total is rendered last, in Inter Bold, at the largest size on the entire screen (`dataLG` or `dataXL` per the established type scale) — this is a deliberate application of "last item in a sequence = most remembered" **combined with** sheer visual weight, so the number doing double duty (both positional and typographic emphasis) is unambiguously the one number a user glancing at their phone for two seconds walks away remembering.

**Below the total:** a small note ("Paid via Card ****4242 · Jan 16, 2025") rendered by `PaymentMethodRow.tsx` (next section) rather than inlined here — keeping the fee math block and the payment-method display as separate components even though they're visually adjacent, since they represent genuinely different data (computed pricing vs. a payment record) and may need to evolve independently (e.g. a future "split payment" feature would only touch the payment method component, not the fee breakdown math).

---

## 9. `src/components/booking/PaymentMethodRow.tsx`

**Responsibility:** Small row — "Paid via [card icon] Card ****4242" + payment date/status.

**Recognition over Recall, concretely:** Showing the **masked last-4 digits** specifically (not "Visa" alone, not "Payment Method 1", not a payment ID) is what lets the user instantly recognize *which of their possibly multiple saved cards* was charged, matching what they saw at the checkout screen during the original `payment.tsx` flow — this is the same visual token carried through from checkout to receipt, which is precisely what makes it recognizable rather than requiring the user to recall or cross-reference which card that was.

**Why its own component and not inlined in `InvoiceFeeBreakdown`:** This exact "masked card + status" pattern is also useful for the existing `PaymentMethodCard.tsx` / `PaymentMethodPicker.tsx` components referenced elsewhere in the app's payment component family — extracting it here (or aligning its visual spec with those) keeps the masked-card presentation consistent across the checkout flow and the receipt, rather than two independently-styled "looks kind of like a card" treatments existing in the codebase.

---

## 10. `app/booking/[id]/invoice.tsx` (screen — assembles sections 4, 6, 7, 8, 9)

**Responsibility:** Composition root for the invoice. Reads `bookingId` from route params, calls `useInvoice`, branches on the discriminated union from section 2.

**Branch handling:**
- `kind: 'pdf'` → renders the PDF inline (e.g. via a WebView or a "View Invoice PDF" button opening the signed URL, depending on what's cleanest for the target platforms) with a **Download/Share** action wired to the same native share sheet used in the structured branch.
- `kind: 'structured'` → renders `InvoiceHeader` → billed-to/provider info blocks (reusing existing address/worker-summary presentational patterns already established elsewhere in the app, not rebuilt here) → `InvoiceLineItem` list → `InvoiceFeeBreakdown` → `PaymentMethodRow`.

**Share button:** Single native `Share.share()` call (Jakob's Law — no custom share UI) — shares either the PDF URL directly (PDF branch) or a formatted text/plain summary plus a note pointing to the app for full detail (structured branch, since there's no PDF to attach in that case unless the app also generates one client-side, which is out of scope for this day).

**Animation:** None beyond the standard screen mount transition, exactly as specified — this screen is read, not interacted with, and any motion here would be actively counterproductive to the "calm, official document" tone the whole file family is built around.

---

## 11. `src/components/booking/DisputeInfoBanner.tsx`

**Responsibility:** The calm, expectation-setting banner at the top of the dispute screen ("We're here to help. Disputes are reviewed within 24 hours.") — extracted as its own component specifically because **tone-setting UI like this is a reusable pattern**, not a one-off: a similar calm-banner treatment likely belongs at the top of a future "Contact Support" screen, a delete-account confirmation, or any other screen where the user is in a slightly elevated emotional state and needs to be met with reassurance before being asked for input.

**Zero-anxiety design, concretely:** This component is placed **structurally first** in the dispute screen's render order, above the reason radio group — the ordering itself is the UX decision, not just the banner's existence. A calm statement read *before* being asked to categorize a complaint measurably changes the emotional entry point into the form versus the same banner placed after the reason selector (where the user has already started forming frustration-tinged input before being reassured).

---

## 12. `src/components/booking/DisputeReasonRadioGroup.tsx`

**Responsibility:** Exactly 5 radio options, each rendered as a complete recognizable statement, not an abstract category — as enforced by the `DisputeReason` union type from section 2.

**Hick's Law, concretely:** The component's props/API should make it **structurally awkward to add a 6th option** (e.g. it renders directly off the fixed union type rather than accepting an arbitrary `options: string[]` array) — this is the same "bake the constraint into the component's shape, not just its current usage" principle applied on Day 32/33 to other components, ensuring the design decision survives future feature requests without a deliberate, visible type change.

**Selection behavior:** Standard radio semantics — selecting one fills it and clears any other selection, `selectionAsync` haptic per change, immediate 150ms color-fill timing (not spring, per the "binary flip, not a physical object" rationale already stated in the original spec) — worth restating here because it's a small but easy-to-get-wrong detail: using a spring on a radio fill would subtly suggest "this is a fun/expressive interaction," which is the wrong tone for selecting a complaint category.

---

## 13. `src/components/booking/DisputeEvidenceSlot.tsx`

**Responsibility:** The file that solves hard problem #3 — **one slot's own independent state machine**: `empty → picking → uploading → success | error`.

**Why each slot owns its own state rather than the parent grid owning one array of statuses:** Encapsulating the state machine at the slot level means each slot's picker interaction, upload call, retry-on-error, and remove-before-submit logic are all self-contained and independently testable — the parent (`DisputeEvidenceUpload.tsx`, next section) only needs to know "give me the list of successfully uploaded URLs across however many slots are filled," not manage the internal transitions of each slot itself. This is the same isolation principle used for `NotificationSwipeRow` on Day 32 — complex per-item interactive state belongs at the item level, not hoisted into a parent that then has to track an array of sub-states.

**Behavior per slot:**
1. Empty state: shows a "+" placeholder, tappable.
2. Tap → opens the same `expo-image-picker` ActionSheet pattern already established for avatar upload (Camera / Gallery / Cancel) — Jakob's Law, reusing an existing in-app convention rather than inventing a new photo-picking flow specifically for disputes.
3. Image selected → **compressed client-side before upload** (matching the existing avatar/document upload compression convention already used elsewhere in the app, e.g. the Worker Service's avatar upload flow) — evidence photos don't need to be full camera resolution, and compressing before upload both speeds up the upload and reduces the chance of a large-file timeout on a poor connection, which matters more here than for a casual chat image since a failed evidence upload directly blocks the user's ability to file their dispute.
4. Uploading → slot shows a small inline progress indicator (not a full-screen blocker — the user should be able to keep filling other slots or start writing their description while one photo uploads in the background).
5. Success → slot fills with the thumbnail, opacity fade-in 150ms (per spec — no bounce).
6. Error → slot shows a retry affordance (a small refresh icon over the failed thumbnail/placeholder) rather than silently reverting to empty — the user should never have to guess whether their upload attempt failed or just hasn't started; the failure state must be visually distinct and actionable.
7. Filled slot supports a small "x" remove action (distinct from the retry affordance in the error state) to clear and return to empty before submission.

---

## 14. `src/hooks/useEvidenceUpload.ts`

**Responsibility:** Coordinates the array of up to 3 slot states at the hook level, so `DisputeEvidenceUpload.tsx` (the grid component) and `dispute.tsx` (the screen, for submit-gating) both have a single source of truth for "how many photos are done uploading and what are their URLs."

**Exposes:**
- `slots`: array of up to 3 slot states (each matching the state machine from section 13).
- `uploadedUrls`: derived, memoized array of only the `success`-state slots' URLs — this is what actually gets sent in the dispute submission payload.
- `isAnyUploading`: derived boolean — **this is the piece that solves hard problem #4** (submit button behavior while an upload is still in flight). Rather than blocking Submit outright while any photo uploads, the Submit button's behavior is: if `isAnyUploading` is true when tapped, the button enters a "waiting for photos" sub-state (label changes briefly, e.g. "Finishing upload…") and the actual dispute submission call is deferred until all in-flight uploads settle — rather than either (a) blocking the button entirely while any photo uploads (frustrating, since text description could be filled in parallel) or (b) submitting immediately and silently dropping the in-flight photo (data loss the user wouldn't notice until support asks "where's your evidence"). This deferred-submit behavior is the correct middle ground and is worth its own named piece of logic rather than an ad-hoc `if` in the screen file.

---

## 15. `src/components/booking/DisputeEvidenceUpload.tsx`

**Responsibility:** The 3-slot grid layout — purely arranges 3 `DisputeEvidenceSlot` instances side by side, reading/writing through `useEvidenceUpload`. No upload logic of its own, per the isolation principle in section 13.

**Jakob's Law, concretely:** Grid spacing, slot size, and the "+" placeholder affordance are visually matched to the existing photo-grid pattern already used elsewhere in the app (the address-picker photo affordances referenced in the original spec) — a user who has already learned "square with a plus = tap to add a photo" from one part of the app should not have to relearn a differently-styled equivalent here.

---

## 16. `src/hooks/useDispute.ts`

**Responsibility:** Owns the actual dispute mutations — `openDispute()`, `getDispute()`, `respondToDispute()`.

**`openDispute()` behavior:**
1. Validates the payload has a selected `reason` and a `description` of at least 20 characters — this mirrors the inline validation already shown in the form (section 17), but the hook re-validates independently rather than trusting the UI layer alone, since a hook that can be called from elsewhere (or during a future refactor) should not silently accept an invalid payload just because "the form already checked."
2. Reads `uploadedUrls` from `useEvidenceUpload` (or receives it as an argument, keeping the two hooks decoupled the same way `useSubmitReview`/`useReviewFormState` were kept decoupled on Day 33).
3. Fires `POST /bookings/:id/dispute`.
4. On success: invalidates the booking detail query (status flips toward `DISPUTED`), navigates to a dispute-detail/confirmation view — **not** back to the booking list, since the user should land somewhere that confirms "your dispute was received," consistent with the "resolution-pending state, not a celebration" tone specified in the original microinteraction notes.
5. On failure: preserves form state (reason, description, uploaded evidence) exactly as `useSubmitReview` did on Day 33 — losing a user's typed complaint description to a network hiccup is a serious enough regression that this pattern is worth restating as a hard requirement here too, not just assumed carried over.

---

## 17. `app/booking/[id]/dispute.tsx` (screen — assembles sections 11, 12, 15)

**Responsibility:** Composition root. Order, top to bottom: `DisputeInfoBanner` → booking context summary (reusing the same lightweight booking-summary pattern as Day 33's `ReviewWorkerContext`, not rebuilt from scratch) → `DisputeReasonRadioGroup` → description `TextInput` (min 20 chars, live validation, matching the character-counter pattern established on Day 33's `ReviewCommentInput` for consistency, though here the counter communicates a **minimum** being approached rather than a maximum) → `DisputeEvidenceUpload` → sticky `[Submit Dispute]` button.

**Submit-gating logic (final assembly of hard problems #3 and #4 together):** Submit is disabled until `reason` is selected **and** `description.length >= 20`; evidence is never a gating condition (it's explicitly optional per the original spec) but the deferred-submit behavior from section 14 applies if photos are still mid-upload when the user taps Submit despite text validation already passing.

---

## 18. `src/hooks/useCancelBooking.ts`

**Responsibility:** Separate from `useDispute` entirely — cancellation is a different action with a different policy (refund %, not evidence/reason categorization) and a different destination (stays on/returns to the booking, doesn't navigate to a dispute-detail view).

**Behavior:**
1. Reads the current booking's status/timing, calls `computeRefundPolicy()` (section 5) to get the `RefundPolicyResult` shown in the modal.
2. On confirm, fires `PATCH /bookings/:id/cancel` with `cancel_reason`.
3. On success: invalidates the booking detail + bookings list queries, closes the modal, likely navigates back to the bookings list (the cancelled booking no longer needs a detail view open).
4. On failure: keeps the modal open with an inline error rather than silently closing — a failed cancellation must not appear to have succeeded to the user.

---

## 19. `src/components/booking/RefundPolicyNotice.tsx`

**Responsibility:** Small, isolated display component — takes a `RefundPolicyResult` (section 2/5) as a prop, renders the plain-language sentence ("You'll receive a 90% refund" / "No refund — job has already started").

**Why extracted from `BookingCancelModal.tsx` itself:** Keeping the *display* of the refund result separate from the *modal chrome* (confirm/cancel buttons, bottom sheet mechanics) means this notice could be reused anywhere else cancellation policy needs to be communicated (e.g. a future "Cancel" button shown inline on a booking detail screen before the modal even opens, as a preview) without dragging the whole modal component along with it.

---

## 20. `src/components/booking/BookingCancelModal.tsx`

**Responsibility:** Bottom sheet — booking summary, `RefundPolicyNotice`, and the two action buttons.

**Fitts's Law, concretely:** Confirm (destructive, red fill or red outline depending on final visual spec) and Keep Booking (neutral outline) are both exactly 52px height, full-width within the sheet, stacked — **equal size deliberately**, so that ease-of-tap is identical for both and the only signal steering the user's decision is color/label semantics, not an asymmetric "the safe option is bigger and easier to hit" layout trick. This is worth stating explicitly as a *rejected* pattern too: some apps deliberately make the "safe" button bigger to nudge behavior — this app's stated design principle is that both options should be equally easy to select, letting the refund information itself (not button geometry) be what informs the decision.

**Confirmation depth:** Tapping the destructive "Cancel Booking" button inside this already-a-confirmation sheet is the **single confirm** — this sheet itself *is* the confirmation step (opened from a "Cancel" action elsewhere, e.g. on the booking detail screen), so there is no further nested "are you really sure" dialog on top of it. Stacking multiple confirmation layers is a common overcorrection that trains users to blindly tap through dialogs; one well-designed confirmation sheet with clear, dynamically-computed consequences (the refund notice) is the correct amount of friction here.

---

## 21. UX Laws — Implementation-Level Detail (cross-cutting)

- **Aesthetic-Usability Effect:** Enforced by `InvoiceHeader.tsx` + consistent spacing/typography discipline across every invoice sub-component — the receipt-like polish is a deliberate, itemized set of small styling decisions (section 6), not a vague aspiration.
- **Serial Position Effect:** Enforced twice on the invoice screen — line items preserve booking-creation order (section 7), and the Total is both positionally last *and* typographically dominant (section 8) — the two reinforcing mechanisms are what make this law's application actually effective rather than incidental.
- **Recognition over Recall:** Enforced by `PaymentMethodRow.tsx`'s masked-card display (section 9) and `DisputeReasonRadioGroup.tsx`'s complete-statement option wording (section 12) — both are concrete content decisions, not abstract principles.
- **Hick's Law:** Enforced structurally by `DisputeReason`'s fixed union type (section 2) and the radio group component's shape (section 12) — the 5-option constraint survives future feature pressure because it's baked into the type system, not just today's UI.
- **Fitts's Law:** Enforced by `BookingCancelModal`'s equal-size button decision (section 20) — deliberately chosen over a size-based nudge, with the reasoning stated explicitly rather than left implicit.
- **Jakob's Law:** Enforced by reusing the existing photo-picker ActionSheet pattern (section 13) and native share sheet (section 10) rather than building dispute/invoice-specific equivalents.
- **Zero-anxiety design:** Enforced by `DisputeInfoBanner`'s structural placement *before* any input field (section 11), not just its copy.

---

## 22. Typography Reference for This Day

```
Poppins           → "TASKLYNC" wordmark, "Raise Dispute" / invoice screen
                     titles, RefundPolicyNotice headline sentence
Plus Jakarta Sans  → Service names on invoice line items, dispute reason
                     labels, dispute description textarea, DisputeInfoBanner
                     body copy, "Cancel Booking" / "Keep Booking" button labels
Inter              → All prices (line items, subtotal, platform fee, total),
                     invoice number, payment date, refund percentage number
                     itself within RefundPolicyNotice's sentence
```

---

## 23. Edge Cases Checklist

| Edge case | Expected behavior |
|---|---|
| `getInvoice` returns the PDF-URL branch | Screen renders the PDF/download path, not a blank structured-invoice attempt (guarded by the discriminated union in section 2) |
| User cancels a booking that's already `IN_PROGRESS` | `refundPolicy.ts` returns 0%/dispute-only messaging; modal's Confirm button label may need to reflect this isn't a standard refund-cancel but a different consequence — worth a copy review, not just a math check |
| Evidence slot upload fails mid-way | Slot shows retry state (section 13), does not silently revert to empty, does not block filling other slots |
| User taps Submit Dispute while 1 of 3 photos still uploading, text validation already valid | Deferred-submit behavior (section 14) — button shows a brief waiting state, submits automatically once upload settles, rather than either blocking immediately or silently dropping the photo |
| User removes a successfully uploaded photo before submitting | `useEvidenceUpload`'s `uploadedUrls` recomputes immediately, excluding the removed slot |
| Network fails on dispute submit | Reason, description, and already-uploaded evidence URLs are preserved; user can retry without re-entering or re-uploading anything |
| Network fails on cancel confirm | Modal stays open with inline error, does not optimistically close (section 18) |
| Description exactly at 19 vs 20 characters | Submit remains disabled at 19, enables at exactly 20 — boundary condition worth an explicit test, not just "roughly around 20" |
| `getInvoice` PDF vs JSON split not yet confirmed with backend | Resolved via the explicit flag in section 3, before building the branch-handling logic in section 10 |

---

## 24. Testing Plan for the Day

| Scenario | Check |
|---|---|
| Invoice loads (structured branch) | All line items in original booking order, fee math correct, total visually dominant, payment method masked-card shown |
| Invoice loads (PDF branch) | PDF viewable/downloadable, share button shares the correct URL |
| Invoice share | Native OS share sheet opens, no custom UI |
| Dispute reason selection | Exactly 5 options render, selecting one clears any prior selection, haptic + 150ms fill confirmed (not spring) |
| Dispute description | Counter/validation gates Submit correctly at the 20-char boundary |
| Evidence upload — happy path | All 3 slots fillable, compress-then-upload confirmed, thumbnails render on success |
| Evidence upload — failure path | Simulated network failure shows retry state per slot, retry succeeds without re-picking the photo |
| Dispute submit while photo mid-upload | Deferred-submit behavior confirmed, no dropped evidence, no premature submission |
| Dispute submit failure | Form state fully preserved, user can retry |
| Cancel modal — booking >24h out, accepted | Shows 90% refund notice |
| Cancel modal — booking <24h out, accepted | Shows 50% refund notice |
| Cancel modal — booking in progress | Shows 0%/no-refund, dispute-only messaging |
| Cancel modal button sizing | Confirm and Keep Booking measured equal height/width, no visual size bias |

---

## 25. Build Order for the Day

1. `booking.types.ts` extensions (discriminated `InvoiceData`, `DisputeReason` union, `RefundPolicyResult`)
2. `booking.api.ts` additions — confirm the invoice PDF-vs-JSON split question with backend here, before building screen branch logic
3. `refundPolicy.ts` (pure function, unit-testable in isolation immediately, no UI dependency)
4. `useInvoice.ts` (thin, quick)
5. `InvoiceHeader.tsx`, `InvoiceLineItem.tsx`, `InvoiceFeeBreakdown.tsx`, `PaymentMethodRow.tsx` (presentational, build in parallel — no interdependencies)
6. `app/booking/[id]/invoice.tsx` (composition root for invoice — invoice side fully done before moving to dispute)
7. `DisputeEvidenceSlot.tsx` (the most complex single component of the day — build and test its state machine in isolation before the grid that wraps it)
8. `useEvidenceUpload.ts` (coordinates the slots built in step 7)
9. `DisputeEvidenceUpload.tsx` (thin grid wrapper)
10. `DisputeInfoBanner.tsx`, `DisputeReasonRadioGroup.tsx` (presentational, quick)
11. `useDispute.ts`
12. `app/booking/[id]/dispute.tsx` (composition root for dispute)
13. `refundPolicy.ts` consumers: `RefundPolicyNotice.tsx`, `BookingCancelModal.tsx`, `useCancelBooking.ts`
14. Manual QA matrix (section 24)

---

*Day 34 — Invoice & Dispute Screens — Deep Implementation Plan*
*Tasklync · React Native Expo · Principal Engineering Standard*
