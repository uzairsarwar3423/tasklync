# ⭐ DAY 33 — Review Screen (Post-Booking)
### Deep Implementation Plan · Principal React Native Engineer Level
> Scope: Post-booking review flow for Tasklync User App (Expo SDK 52, Expo Router, Zustand, TanStack Query, Reanimated 3)
> This is the **emotional closing day** of the booking lifecycle — the last screen a user sees for a completed job. Unlike Day 31/32 (pure infrastructure/data-list engineering), this day is about **form-state sequencing, layout stability during progressive disclosure, and getting one animation exactly right** rather than solving many hard technical problems.

---

## 0. Why This Day Is Architected the Way It Is

A review form looks like "just a form," but a review form that respects the stated UX laws is actually **four distinct engineering problems**, each easy to get subtly wrong:

1. **Progressive disclosure without layout jank** — revealing the category section after the overall rating is set must not cause the Submit button to jump, the ScrollView to jitter, or the keyboard-avoiding behavior to misbehave when the comment box is focused mid-reveal.
2. **Two independent "required-ness" rules on one screen** — overall rating is hard-required (blocks submit), category ratings are soft-optional (can be skipped without blocking submit), and comment is fully optional. A single naive `formState.isValid` boolean cannot express this — the validation model needs to be explicit about which fields gate submission and which don't.
3. **A one-shot success state that must not be re-enterable** — once submitted, the screen must not allow a second submission (double-tap, or navigating back into the same route), and the auto-navigate-after-2s timer must be cancellable if the user manually navigates away first (a classic memory-leak/navigation-after-unmount bug).
4. **A "skip" path that still completes a side effect** — skipping must still mark the pending-review reminder as seen server/cache-side, which means "skip" is not simply `router.back()`, it's a lightweight mutation followed by navigation.

Everything below is structured to solve these four cleanly, with the visual/animation spec treated as the easy part layered on top of a correct state model.

---

## 1. Complete File Tree for the Day

```
app/
  └── booking/
      └── [id]/
          └── review.tsx                    # SCREEN: Leave Review

src/
  ├── components/
  │   └── review/
  │       ├── ReviewWorkerContext.tsx        # avatar + name + job summary card
  │       ├── CategoryRatingRow.tsx          # single row: label + mini stars
  │       ├── CategoryRatingSection.tsx      # NEW — groups 4 rows + reveal animation + "Almost done" copy
  │       ├── ReviewCommentInput.tsx         # NEW — textarea + live character counter, isolated for reuse
  │       └── ReviewSuccessState.tsx         # post-submit confirmation view
  │
  ├── components/ui/Rating/
  │   └── RatingInput.tsx                    # (existing, Day-15 lib) — extended with a `size="lg"` variant
  │
  ├── hooks/
  │   ├── useSubmitReview.ts                 # mutation: submitReview()
  │   ├── useSkipReview.ts                   # NEW — separate mutation: dismissPendingReview()
  │   └── useReviewFormState.ts              # NEW — isolated form-state machine, no UI concerns
  │
  ├── services/api/
  │   └── review.api.ts                      # submitReview(), getPendingReviews(), dismissPendingReview()
  │
  └── types/
      └── review.types.ts                    # NEW — ReviewCategoryKey, ReviewSubmitPayload, ReviewFormState
```

**4 files added beyond the original list** — `CategoryRatingSection.tsx`, `ReviewCommentInput.tsx`, `useSkipReview.ts`, `useReviewFormState.ts` — each exists to isolate one of the four hard problems above into its own testable unit rather than letting the screen file grow into an unmanageable single component juggling reveal animation, validation, and two different mutations at once.

---

## 2. `src/types/review.types.ts` (build first)

**Responsibility:** Shared shape for the review form's internal state and the API payload — kept as **two distinct types**, not one, because the form's in-progress state (stars not yet tapped = `0`, comment possibly empty string) is not the same shape as a valid submission payload (which requires `rating >= 1`). Conflating "draft state" and "valid payload" into one type is a common source of TypeScript lying to you about whether a field is actually safe to send to the server.

**Category keys:** `'punctuality' | 'quality' | 'communication' | 'value'` — defined once here, consumed by `CategoryRatingSection.tsx` (to render the 4 rows) and `review.api.ts` (to shape the request body), so the four category labels/keys can never drift out of sync between the UI and the network layer.

---

## 3. `src/hooks/useReviewFormState.ts`

**Responsibility:** This is the file that solves hard problem #2 — it is a **pure state hook with zero JSX**, owning: `overallRating` (number, 0 = unset), `categoryRatings` (object, all default 0/unset), `comment` (string), and a derived `canSubmit` boolean.

**Why this must be extracted from the screen component rather than living as several `useState` calls inline:**
- `canSubmit` is a derived value (`overallRating > 0`) that multiple pieces of UI need to read (Submit button's disabled state, and potentially a future analytics event) — deriving it in one hook rather than recomputing the same condition in two components prevents the two places from silently disagreeing if the rule ever changes (e.g. product later decides comment becomes required past a certain rating).
- Keeping this hook UI-free makes the **validation rule itself unit-testable** without rendering anything — feed it a sequence of state updates, assert `canSubmit` transitions correctly at each step. This is the kind of logic that's trivial to verify in isolation and painful to verify by simulating taps on a rendered screen.
- This hook is also where the **reveal trigger** lives — it doesn't own the animation itself, but it exposes a simple `shouldShowCategorySection: boolean` derived from `overallRating > 0`, which `CategoryRatingSection.tsx` reads to decide whether to animate in. Separating "should this be visible" (a state hook's job) from "how does it animate into visibility" (a component's job) is what keeps the animation code simple and the state logic simple, instead of one file doing both.

---

## 4. `src/components/ui/Rating/RatingInput.tsx` (extended, not newly built)

**Responsibility:** This component already exists (Day 15's shared UI library). Today's work is adding a `size="lg"` variant (40px stars) specifically for this screen's overall-rating row, alongside the existing smaller variant already used for category rows and elsewhere in the app.

**Why a variant prop instead of a separate component:** The tap/haptic/scale-bounce *behavior* of a star rating input is identical regardless of size — only the rendered dimensions differ. Building a second component (`LargeRatingInput`) would duplicate the gesture and haptic logic for no reason; a `size` prop keeps one implementation of "what a star rating input does" and lets each call site (this screen's overall rating vs. `CategoryRatingRow`'s mini stars) just pass different visual parameters.

**Behavior added for this screen specifically:**
- Supports **drag-to-rate** in addition to discrete taps (dragging a finger across the 5 stars updates the rating live as the finger crosses each star's boundary) — this is a small but real usability improvement for a large touch-target rating row, letting a user rate in one continuous gesture rather than 5 discrete taps if they prefer.
- Exposes an `onChange` callback that fires once per **committed** value change (not on every pixel of drag movement) — this is what keeps the haptic (`selectionAsync`) firing once per star crossed, not dozens of times per drag gesture, which would feel like a buzzing mess rather than a tactile rating experience.

---

## 5. `src/components/review/ReviewWorkerContext.tsx`

**Responsibility:** Small, static context card at the top of the screen — avatar, worker name, and a one-line job summary (service name + date), pulled from the booking detail already available via route params / a lightweight booking query (this screen is reached from a completed booking, so the booking data is either passed via navigation params or refetched with a cheap, already-cached `booking/:id` query — no new query needed here, reusing what booking-detail screens already fetch).

**Design rationale:** This card exists purely to **re-anchor context** — a user arriving here from a push notification ("Rate your experience") days after the actual job may not immediately recall which worker/job this is about; showing the worker's face and job summary before asking for a rating removes a moment of "wait, who is this again?" confusion that would otherwise slow down the very first interaction on the screen.

---

## 6. `src/components/review/CategoryRatingRow.tsx`

**Responsibility:** One row — label text (Punctuality / Quality / Communication / Value) + a small `RatingInput` (default/small size, reused from the same component as section 4, no size override needed here).

**Layout:** Label left-aligned, stars right-aligned, single row ~44px height — deliberately compact since these four rows are the "detail" pass, not the primary decision, per the progressive-disclosure hierarchy the whole day is built around.

**Recognition over Recall enforcement, concretely:** The label is rendered **inline with its stars, always**, never as a column header above a grid of unlabeled star rows — a grid layout (common in lazier review-form implementations) would force the user to visually trace up to a header to remember which column means what; keeping label+stars paired per row means zero recall burden, ever, even if the user's eyes land mid-scroll on row 3 first.

---

## 7. `src/components/review/CategoryRatingSection.tsx`

**Responsibility:** The file that solves hard problem #1 (progressive disclosure without layout jank) and owns the Goal-Gradient copy ("Almost done — rate the details").

**Reveal implementation:**
- Reads `shouldShowCategorySection` from `useReviewFormState()` (section 3) — this component does not decide *when* to appear, only *how*.
- Uses `Reanimated`'s layout animation (`entering` prop or an animated height/opacity/translateY combination) so that **when this section mounts, the ScrollView content below it (comment box, submit button) reflows smoothly** rather than snapping instantly into new positions — this is the specific layout-jank risk called out in problem #1, and the fix is ensuring the reveal animation and the surrounding ScrollView's content resize are the same animated transaction, not two independent state changes racing each other.
- Single 250ms spring-default for the whole section (opacity 0→1, translateY 12→0) as specified — deliberately **not** staggering the 4 rows individually, both for the stated speed reason and because per-row staggering would also mean 4 separate layout-affecting animations instead of 1, quadrupling the surface area for the exact jank problem this file exists to prevent.

**Keyboard interaction consideration:** If the comment box (rendered below this section) is already focused when this section reveals (edge case: user tapped the comment box before rating, then goes back and sets a rating — unlikely but possible flow), the reveal must not cause the focused input to visually jump under the keyboard or lose focus. This is worth an explicit QA check rather than an assumption, since `KeyboardAvoidingView` + animated layout changes is a known source of subtle iOS/Android behavioral differences.

---

## 8. `src/components/review/ReviewCommentInput.tsx`

**Responsibility:** Isolated textarea component with a live character counter ("120 / 500"), extracted from the screen file specifically so its debounced counter-update logic and multiline `TextInput` configuration (auto-grow, `maxLength`, `textAlignVertical: 'top'` on Android) are testable and reusable independent of the review screen's broader state.

**Behavior:**
- `maxLength={500}` enforced natively on the `TextInput` (hard stop, not just a warning) — this is simpler and more reliable than a soft-limit-with-truncation approach and matches how every comparable app (App Store reviews, etc.) behaves, which is itself a small Jakob's Law application even though not explicitly called out in the original spec.
- Counter color/tone shifts subtly (not animated, just a conditional style — Type 1 functional, not expressive) once the user crosses ~90% of the limit (450/500), giving a quiet heads-up before the hard stop rather than the user discovering the limit only by hitting a wall mid-sentence.

---

## 9. `src/components/review/ReviewSuccessState.tsx`

**Responsibility:** The Peak-End payoff — this is the file that solves hard problem #3 (a one-shot state that can't be re-entered or leak a timer).

**Rendering approach:** Rather than a separate route/screen, this is rendered as a **full-screen overlay/replacement within `review.tsx`** once submission succeeds (a local boolean state flip, e.g. `hasSubmitted`), not a `router.push()` to a new route — this is a deliberate choice: pushing a new route for a success state would leave the review form still on the stack underneath it, reachable via back-navigation, which would let a user "go back" into a form for a review they already submitted. Rendering it as a replacement within the same mounted screen avoids that entirely, and the eventual `router.replace()` to booking-detail (not `router.push()`) after the 2s delay ensures the review screen itself isn't left in the navigation stack either.

**Timer safety:** The 2-second auto-navigate delay is implemented as a `useEffect` with a `setTimeout`, cleaned up in the effect's return function — this specifically guards against the case where the user manually taps something (a back gesture, a notification, an unrelated navigation) *during* the 2-second window, which without cleanup would fire a navigation call after the component (and possibly the whole screen stack) has already unmounted — a classic "can't perform a state update / navigate on an unmounted component" bug that's easy to introduce and easy to miss in casual testing since it only reproduces with specific timing.

**Content:** Single checkmark, scale-in only (spring-bouncy, per spec — the one expressive moment on this screen), "Review submitted!" (Poppins SemiBold), no confetti/Lottie — consistent with the phase-wide minimum-motion policy. The emotional payoff is intentionally carried by copy + the clean resolution of the flow, not by particle effects.

---

## 10. `src/hooks/useSubmitReview.ts`

**Responsibility:** The primary mutation — `submitReview()`.

**Behavior:**
1. Takes the current form state from `useReviewFormState()` (or receives it as an argument from the screen, whichever keeps the two hooks decoupled — this hook should not itself own form state, only the act of submitting whatever valid payload it's given, keeping mutation logic and form logic separable and each independently testable).
2. Fires `POST /reviews` with `bookingId`, `targetId`, `targetType: 'worker'`, `rating`, `categories{}`, `comment`.
3. On success:
   - Invalidates the `worker/:id` profile query (server recalculates `avg_rating` via the `review.submitted` Kafka consumer documented in `KAFKA_EVENTS.md`/`04_USER_WORKER_SERVICE.md` — the client doesn't recompute anything locally, it simply invalidates so the next profile view refetches the authoritative number).
   - Invalidates the `bookings` list query (so the completed booking's card no longer shows a "Rate now" prompt).
   - Invalidates `reviews/pending` (so this specific booking drops out of the pending-reviews set used by reminder banners elsewhere in the app).
4. On failure: surfaces an inline error (toast or inline message) and **does not** clear the user's already-entered ratings/comment — losing a user's carefully-considered review text on a network hiccup would be a genuinely bad experience; the form state must survive a failed submit attempt so the user can simply retry.

**Double-submission guard:** The mutation's own `isPending`/`isLoading` state is what disables the Submit button during the request (standard TanStack Query pattern) — combined with the `hasSubmitted` local flag in section 9 that swaps the entire screen to the success state on success, there are two independent guards against a double-fire: the button is disabled mid-request, and the form is fully unmounted/replaced the instant a request succeeds.

---

## 11. `src/hooks/useSkipReview.ts`

**Responsibility:** Solves hard problem #4 — "skip" is a real, small mutation, not just a navigation call.

**Behavior:**
1. Calls a lightweight `dismissPendingReview(bookingId)` — marks this booking's pending-review reminder as seen/dismissed **without** submitting an actual review.
2. On settle (success or failure — this is a low-stakes, non-critical call), navigates back regardless. A failed "dismiss" call should not block or delay the user's ability to leave the screen; worst case, the reminder banner reappears later, which is a minor inconvenience, not a broken flow — so this call is fired and the navigation proceeds optimistically without waiting for confirmation.

**Why this needs its own hook rather than being an inline `onPress` in the screen:** Keeping "skip" as a named, testable unit (separate from "submit") makes the two very different user paths (complete vs. abandon) equally easy to reason about and equally easy to unit test, rather than "skip" being an afterthought one-liner buried at the bottom of the screen component.

---

## 12. `src/services/api/review.api.ts`

**Responsibility:** Thin HTTP layer.

**Functions:**
- `submitReview(payload)` → `POST /reviews`
- `getPendingReviews()` → `GET /reviews/pending`
- `dismissPendingReview(bookingId)` — **flagged, same as Day 32's delete-notification situation**: this exact endpoint is not explicitly documented in `ALL_API_ENDPOINTS.md`. Before building `useSkipReview.ts`, confirm with backend whether "skip" should be a real server-side dismiss call, or purely a client-side local flag (e.g. stored in `AsyncStorage`/Zustand, keyed by `bookingId`, checked against `reviews/pending` results to filter out locally-dismissed items). The client-side-only approach is a perfectly valid fallback if backend doesn't want to add a new endpoint for this — worth deciding explicitly rather than assuming.

---

## 13. `app/booking/[id]/review.tsx` (the screen — assembles everything above)

**Responsibility:** Composition root. Reads `bookingId` from route params, wires `useReviewFormState`, `useSubmitReview`, `useSkipReview`, and conditionally renders either the form or `ReviewSuccessState` based on the local `hasSubmitted` flag.

**Structure:**
- Header: back button + "Rate your experience" (Poppins).
- `ReviewWorkerContext` (static, top of scroll).
- Overall rating section: "How was your experience?" (Jakarta) + large `RatingInput`.
- `CategoryRatingSection` (conditionally revealed).
- `ReviewCommentInput`.
- Sticky footer: `[Submit Review]` (disabled until `canSubmit`) + `[Skip for now]` text link beneath it.
- Full-screen swap to `ReviewSuccessState` once `hasSubmitted` is true.

**KeyboardAvoidingView wrapping:** Required around the ScrollView given the comment textarea — standard pattern already established elsewhere in the app (`platform.select` behavior difference between iOS `padding` and Android `height`, per the existing app conventions).

---

## 14. UX Laws — Implementation-Level Detail

- **Hick's Law:** Enforced structurally, not just visually — `useReviewFormState.ts`'s `canSubmit` derivation depends **only** on `overallRating`, never on category ratings or comment, which is what makes the "1 required decision, rest optional" rule actually true at the data layer, not just implied by the UI hiding things.
- **Goal-Gradient Effect:** Enforced by the copy change inside `CategoryRatingSection.tsx` appearing at the exact moment the section reveals — the "Almost done" framing is tied to the same trigger as the visual reveal, so the motivational copy and the visual progress cue land simultaneously, reinforcing each other rather than being two disconnected UI changes.
- **Recognition over Recall:** Enforced by `CategoryRatingRow.tsx`'s label+stars pairing (section 6) — every row is self-explanatory in isolation, no header-scanning required.
- **Peak-End Rule:** Enforced by `ReviewSuccessState.tsx` being a genuinely distinct, deliberate final state (section 9) rather than a toast-and-pop pattern — the *last thing* the user experiences in the entire booking lifecycle is a designed resolution moment, not an abrupt screen dismissal.
- **Fitts's Law:** Enforced by the `size="lg"` variant on the overall `RatingInput` (section 4) being a real, measured 40px target — not just "make it look bigger," but an explicit sizing decision made because this is the one truly consequential tap-precision moment on the screen.

---

## 15. Typography Reference for This Screen

```
Poppins           → Screen title "Rate your experience", worker name in
                     ReviewWorkerContext, "Review submitted!" success headline
Plus Jakarta Sans  → "How was your experience?" prompt, category row labels,
                     comment textarea text, "Skip for now" link, character
                     counter label text ("/ 500")
Inter              → Character counter number itself ("120 / 500" — the
                     numeric portion specifically), job date in
                     ReviewWorkerContext summary line
```

---

## 16. Edge Cases Checklist

| Edge case | Expected behavior |
|---|---|
| User taps overall rating, then taps a lower value before category section finishes revealing | Reveal is driven by `overallRating > 0`, not the specific value — section stays revealed/visible regardless of which star value is currently selected, only disappears if rating somehow returns to 0 (shouldn't be possible via normal interaction, but the derivation should be safe either way) |
| User submits, then immediately taps back before the 2s auto-navigate fires | Timer cleanup on unmount (section 9) prevents a stray navigation call; manual back navigation is respected as-is |
| Network fails on submit | Form state (ratings, comment) is preserved; error surfaced; Submit re-enabled for retry |
| User double-taps Submit rapidly | Button's mutation-pending disabled state blocks the second tap before the first request even resolves |
| User skips, then later reopens the same booking's review screen (e.g. via deep link) | Screen should still function (skip doesn't permanently lock the review — it only dismisses the *reminder*, not the ability to review later, unless product decides otherwise) |
| Comment left empty | Fully valid — comment is optional per the validation model in `useReviewFormState.ts`, submit proceeds with `comment: ''` or omitted per API contract |
| `dismissPendingReview` endpoint doesn't exist server-side | Resolved via the explicit fallback decision in section 12, not discovered mid-build |
| Very long worker name / job summary in `ReviewWorkerContext` | Text truncates gracefully (ellipsis), card height stays fixed, doesn't push the rating section off first paint on smaller devices |

---

## 17. Testing Plan for the Day

| Scenario | Check |
|---|---|
| Tap overall stars 1 through 5 in sequence | Each tap: scale-bounce + haptic fires once per star, no double-fire |
| Drag across overall stars | Rating updates live, haptic fires once per star boundary crossed, not per pixel |
| Category section reveal | Single smooth 250ms transition, no ScrollView jump, Submit button repositions smoothly, not instantly |
| Comment counter | Updates live while typing, hard-stops at 500 characters, tone shifts near limit |
| Submit with only overall rating set | Succeeds — category ratings and comment are genuinely optional |
| Submit disabled state | Confirmed disabled at `overallRating === 0`, enabled the instant it becomes `> 0` |
| Success state | Checkmark bounces in once, auto-navigates after exactly 2s, manual navigation during that window doesn't error |
| Skip | Navigates back immediately without waiting on network, reminder dismissed (or locally filtered per section 12's resolved approach) |
| Backgrounding the app mid-form, returning later | Form state persists for the session (no premature reset) — standard React state survives as long as the screen stays mounted in the navigation stack |

---

## 18. Build Order for the Day

1. `review.types.ts` (shared shapes first)
2. `useReviewFormState.ts` (pure state hook, unit-testable immediately, no UI dependency)
3. `review.api.ts` (confirm the `dismissPendingReview` question with backend here, before building `useSkipReview`)
4. `useSubmitReview.ts` + `useSkipReview.ts`
5. `RatingInput.tsx` `size="lg"` variant extension (small, isolated change to existing component)
6. `ReviewWorkerContext.tsx` (static, no state dependency, quick to build)
7. `CategoryRatingRow.tsx`
8. `CategoryRatingSection.tsx` (depends on `CategoryRatingRow` + the reveal trigger from step 2)
9. `ReviewCommentInput.tsx`
10. `ReviewSuccessState.tsx`
11. `app/booking/[id]/review.tsx` (composition root, wires everything above — built last, since it has no logic of its own to build ahead of its dependencies)
12. Manual QA matrix (section 17)

---

*Day 33 — Review Screen (Post-Booking) — Deep Implementation Plan*
*Tasklync · React Native Expo · Principal Engineering Standard*
