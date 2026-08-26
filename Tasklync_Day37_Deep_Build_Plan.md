# Tasklync — Day 37 Deep Build Plan
## Payment Methods + App Settings + Support
> React Native + Expo Router · Reanimated 3 · Zustand · React Query · Stripe React Native
> Fonts: **Poppins** (identity) · **Plus Jakarta Sans** (UI/body) · **Inter** (numbers/data)
> Senior RN/Expo build spec — file-level, component-level, interaction-level. No code, plan only.

---

## 0. Why This Day Matters (Design Rationale)

Three screens today, one shared emotional register: **calm control**. Payment methods touch money. Settings touch identity/preference. Support touches "something went wrong, help me." None of these are discovery or delight moments — they are trust-and-precision moments. The design mandate for Day 37 is the opposite of the Home screen: **remove motion, remove ambiguity, remove friction only where friction adds no value.**

Three screens in scope:
1. **Payment Methods** (`payment-methods.tsx`)
2. **App Settings** (`settings.tsx`)
3. **Help & Support** (`support.tsx`)
Plus the **Logout flow**, which is triggered from `profile.tsx` but fully specified here since it shares this day's "calm exit" design language.

---

## 1. Full File & Folder Manifest

```
app/profile/
├── payment-methods.tsx                  # SCREEN 1 — Saved cards
├── settings.tsx                         # SCREEN 2 — Language / currency / notifications / about
└── support.tsx                          # SCREEN 3 — FAQ + contact + rate app

src/components/payment/
├── PaymentMethodCard.tsx                # List row: brand icon + masked number + expiry + default chip
├── PaymentMethodCardSkeleton.tsx        # Loading placeholder
├── PaymentMethodPicker.tsx              # Radio-list variant (reused later at checkout)
├── PaymentMethodSwipeActions.tsx        # Delete-only swipe reveal
├── AddCardSheet.tsx                     # Bottom sheet wrapping Stripe CardField
├── AddCardButton.tsx                    # "+ Add New Card" row/button
├── CardBrandIcon.tsx                    # Visa/Mastercard/Amex/Unknown icon resolver
├── SecurePaymentNotice.tsx              # "🔒 Secured by Stripe" trust strip
└── PaymentEmptyState.tsx                # Empty list illustration + CTA

src/components/settings/
├── SettingsSection.tsx                  # Section wrapper: header + grouped rows + divider
├── SettingsRow.tsx                      # Generic row: label + control (chevron/toggle/value)
├── LanguageToggle.tsx                   # English / اردو segmented control
├── CurrencyToggle.tsx                   # PKR / USD segmented control
├── NotificationPreferenceGroup.tsx      # Grouped toggles: push (3) / SMS (1)
├── ToggleRow.tsx                        # Single labeled Switch row (reused inside the group)
└── AppVersionRow.tsx                    # Static build/version display row

src/components/support/
├── FAQAccordion.tsx                     # Single-expand Q&A list
├── FAQAccordionItem.tsx                 # Individual question/answer row
├── ContactOptionRow.tsx                 # WhatsApp / Email / Call rows
└── RateAppRow.tsx                       # Triggers native store review prompt

src/components/feedback/
└── LogoutConfirmSheet.tsx               # Destructive confirm ActionSheet/bottom sheet

src/hooks/
├── usePaymentMethods.ts                 # list / add / delete / setDefault
├── useNotificationPreferences.ts        # get / update preferences
├── useAppPreferences.ts                 # language + currency read/write
└── useLogout.ts                         # orchestrates full session-teardown cascade

src/store/
└── auth.store.ts                        # (extend) logout() action, session-clear cascade

src/services/
└── payments/
    └── stripe.service.ts                # createSetupIntent(), attachPaymentMethod(), detach()

src/types/
├── payment.types.ts                     # PaymentMethod, CardBrand types
└── settings.types.ts                    # NotificationPreferences, AppPreferences types
```

**Total: 3 screens · 20 components · 1 service file · 4 hooks · 1 store extension · 2 types files**

---

## 2. Screen 1 — Payment Methods (`payment-methods.tsx`)

### 2.1 Layout Anatomy (top to bottom)

| Zone | Component | Behavior |
|---|---|---|
| Header | "Payment Methods" + back | Static |
| Body | `FlashList<PaymentMethod>` of `PaymentMethodCard` (wrapped in `PaymentMethodSwipeActions`) | `estimatedItemSize` 72px |
| Footer (sticky) | `AddCardButton` — "+ Add New Card" | Opens `AddCardSheet`, does not navigate away |

### 2.2 `PaymentMethodCard.tsx` — Component Spec
- **Left**: `CardBrandIcon` (36×24px, resolves Visa/Mastercard/Amex/generic-card icon from `brand` field)
- **Middle**: masked number `•••• 4242` (Inter, since it's numeric data) on line 1, "Expires 08/27" on line 2
- **Right**: "Default" chip if `is_default`, otherwise a subtle "Set as default" text-link (tap → optimistic reorder, no confirmation needed — non-destructive)
- **Press**: card row itself is **not** pressable (no edit-in-place for a card — cards are immutable) — only the swipe/delete and the default-link are interactive

### 2.3 `PaymentMethodSwipeActions.tsx`
- Delete-only reveal (70px width, single red action) — unlike addresses, there is no "Edit" for a card
- Deleting the **default** card triggers a small inline confirm ("This is your default card — delete anyway?") before the swipe-delete commits; deleting a non-default card deletes immediately on confirm tap (lower stakes)

### 2.4 `AddCardSheet.tsx` — Component Spec
- Bottom sheet, snap point 70% (enough room for the Stripe `CardField` + trust copy + button, without covering the whole screen — user should still sense they're "in" payment methods context)
- Contains, top to bottom:
  1. Sheet title: "Add a card"
  2. Stripe `CardField` (native Stripe SDK component — number, expiry, CVC, postal as applicable)
  3. `SecurePaymentNotice` — "🔒 Payments secured by Stripe. Tasklync never stores your card number."
  4. Checkbox: "Save this card for future bookings" (defaulted checked)
  5. Sticky `[Add Card]` button, disabled until Stripe reports the card field as valid
- On submit: `createSetupIntent()` → Stripe confirms → `attachPaymentMethod()` → sheet dismisses → new card appears at top of list with a brief highlight background (not a bounce — a 400ms fade from `green-50` back to white, signaling "this just changed" without playfulness)
- On decline/error: Stripe's own inline field error styling is used (red field border + Stripe's error text) — **do not build a custom error animation over Stripe's own validation UI**, this avoids conflicting feedback systems

### 2.5 `PaymentEmptyState.tsx`
- Illustration (wallet/card themed), "No payment methods yet", "Add a card to book faster", CTA "Add Card" — same visual grammar as `AddressEmptyState` from Day 36, for consistency

### 2.6 Data Layer — `usePaymentMethods.ts`
- `list()` — `GET /payments/methods`
- `add(paymentMethodId)` — `POST /payments/methods`, optimistic insert
- `delete(id)` — `DELETE /payments/methods/:id`, optimistic removal with undo-toast on failure
- `setDefault(id)` — optimistic flag swap, identical pattern to `useAddresses.setDefault()` from Day 36 (consistency across the codebase, not just the UI)

---

## 3. Screen 2 — App Settings (`settings.tsx`)

### 3.1 Layout Anatomy (top to bottom)

| Section | Component | Contents |
|---|---|---|
| **Preferences** | `SettingsSection` | `LanguageToggle`, `CurrencyToggle` |
| **Notifications** | `SettingsSection` | `NotificationPreferenceGroup` (Push: booking updates / chat / promotions; SMS: confirmations only) |
| **About** | `SettingsSection` | `SettingsRow` → Terms of Service, `SettingsRow` → Privacy Policy, `AppVersionRow` (non-interactive) |

### 3.2 `SettingsSection.tsx` + `SettingsRow.tsx`
- `SettingsSection`: renders an uppercase-tracked section header (Poppins SemiBold 13px, `textSecondary`) followed by a white card containing its rows, with 1px dividers between rows (not full-width shadows per row — one card, internal dividers, standard iOS Settings pattern)
- `SettingsRow`: generic — accepts a label, an optional icon, and a trailing control slot (chevron for navigation rows, `Switch` for toggle rows, static text for the version row)

### 3.3 `LanguageToggle.tsx` / `CurrencyToggle.tsx`
- Segmented control, 2 options each, current selection has a `green-600` filled pill background that **slides** between positions (spring-snappy, 200ms) — this is the one intentional bit of motion on this screen, because it's a state that's toggled rarely and deserves a clear, satisfying "locked in" feel
- Selecting a new language does **not** require an app restart — locale context updates live, screen re-renders with new strings immediately (validate this explicitly; a restart requirement would break the "instant apply" contract of this whole screen)

### 3.4 `NotificationPreferenceGroup.tsx` + `ToggleRow.tsx`
- Push section: 3 independent `ToggleRow`s — "Booking updates", "Chat messages", "Promotions & offers"
- SMS section: 1 `ToggleRow` — "Booking confirmations only" (SMS is intentionally minimal — no promotional SMS toggle exists, this is a deliberate product decision to avoid SMS fatigue/cost)
- Each toggle: optimistic update on flip, `PUT /notifications/preferences` fired in background, silent rollback + toast only if the server rejects it

### 3.5 `AppVersionRow.tsx`
- Displays app version + build number (e.g. "v2.4.1 (108)") in **Inter Regular 12px** (it's a version *number*, so it follows the numeric-data font rule) — tapping it 5× reveals a hidden debug/diagnostics panel (common industry pattern for QA/support use, optional but recommended)

---

## 4. Screen 3 — Help & Support (`support.tsx`)

### 4.1 Layout Anatomy (top to bottom)

| Zone | Component | Behavior |
|---|---|---|
| Header | "Help & Support" + back | Static |
| FAQ Section | `FAQAccordion` (list of `FAQAccordionItem`) | Single-expand-at-a-time |
| Contact Section | `ContactOptionRow` × 3 (WhatsApp, Email, Call) | Deep-links to respective native apps |
| Footer | `RateAppRow` | Native store review prompt |

### 4.2 `FAQAccordion.tsx` + `FAQAccordionItem.tsx`
- Content ordering follows **Serial Position Effect**: the single most-asked question ("How do I cancel a booking?") is first, the second-most-common concern ("Is my payment secure?") is last — the middle holds lower-frequency questions, since first and last positions carry the strongest recall
- Only one `FAQAccordionItem` can be expanded at a time — expanding a new one auto-collapses the previous (reduces scroll fatigue, keeps the page short)
- Chevron icon rotates 180° on expand (150ms) — the only per-item motion; content height animates via `LayoutAnimation` or a measured Reanimated height interpolation, never abrupt clipping

### 4.3 `ContactOptionRow.tsx`
- WhatsApp: deep-link to `wa.me` with a pre-filled generic support message
- Email: opens native mail composer pre-addressed to support, subject pre-filled with app version + user ID for faster triage
- Call: `tel:` deep link, only shown in regions where a support phone line exists (config-driven visibility, not hardcoded)

### 4.4 `RateAppRow.tsx`
- Triggers `StoreReview.requestReview()` (Expo's native review prompt) — **never** opens a custom in-app rating modal first; going straight to the native prompt respects platform rate-limiting rules (iOS/Android both throttle how often this can be shown) and avoids the anti-pattern of a fake custom modal in front of a real one

---

## 5. Logout Flow (Full Spec)

Though triggered from `profile.tsx`, the entire flow is designed and built today as part of this day's "calm exit" language.

### 5.1 `LogoutConfirmSheet.tsx`
- On tapping "Log Out" in the profile menu: opens a native `ActionSheetIOS` on iOS, or a minimal bottom sheet on Android (platform-idiomatic, per the design system's platform-differences rule)
- Two options only: **"Log Out"** (destructive red text) and **"Cancel"** — no third option, no extra copy, no "are you sure you're sure" pattern
- On confirm: `useLogout()` executes, in order:
  1. Disconnect any active WebSocket (chat/location sockets)
  2. Clear React Query cache entirely (`queryClient.clear()`)
  3. Clear Zustand stores: `auth.store`, `cart.store`, `location.store` (reset to initial state)
  4. Clear `expo-secure-store` tokens (access + refresh)
  5. Clear any MMKV-persisted non-essential cache
  6. Navigate with `router.replace()` (not `push`) to `(auth)/welcome` — a **replace**, not a push, so the back gesture cannot return into a dead authenticated session

---

## 6. UX Laws — Full Rationale Table

| Law | Applied Where | Concrete Reasoning |
|---|---|---|
| **Hick's Law** | Settings split into 3 sections (Preferences / Notifications / About) instead of one flat list of 8+ rows | Grouped choices are scanned faster than an undifferentiated list — the user's eye processes "which section" before "which row," cutting decision time roughly in half for a returning user |
| **Recognition over Recall** | `CardBrandIcon` (Visa/Mastercard/Amex logos) instead of a text label like "Visa card" | A user recognizes their own card's brand mark instantly; reading "Visa" and matching it mentally to "is that my card" is a slower, unnecessary cognitive step |
| **Jakob's Law** | Swipe-to-delete on payment cards uses the identical gesture and reveal-width as addresses (Day 36) | One gesture language across the entire app — once a user learns swipe-to-delete anywhere in Tasklync, it works everywhere, with zero relearning |
| **Peak-End Rule** | Logout ends with a calm two-option native sheet, not a jarring instant session kill | The *end* of a user's session is a real emotional beat — respecting it with a clean, native-feeling confirmation leaves a better final impression than an abrupt disappearance |
| **Serial Position Effect** | FAQ list ordered: most-asked question first, second-most-common last | Users recall/scan the first and last items in any list best (the classic primacy/recency effect) — the highest-value questions occupy those slots |
| **Fitts's Law** | `ToggleRow` switches and `[Add Card]` sticky button both sized to full native/44px+ touch targets | Frequently-toggled controls (notification prefs) must be easy to hit without looking too hard, since users often adjust these while distracted/multitasking |
| **Goal-Gradient Effect** | `AddCardSheet`'s button stays disabled until the Stripe field reports valid, then instantly enables | The moment the field is complete, the enabled button is the clear, immediate "you're basically done" signal — no ambiguity about whether more steps remain |

---

## 7. Microinteractions & Haptics — Complete Map (Minimal, Justified Set Only)

| Interaction | Motion Spec | Haptic | Why It Exists |
|---|---|---|---|
| Toggle switch flip (notifications) | Native thumb slide, 150ms | `selectionAsync` | Binary state change — lightest possible haptic, no bounce (a celebration here would feel out of place for a routine preference flip) |
| Language/Currency segmented pill slide | 200ms spring-snappy | `selectionAsync` | The one deliberately "felt" motion on the settings screen — this is a rarer, more meaningful state change and deserves a clean, satisfying lock-in |
| FAQ chevron rotate + content expand | 150ms rotate, height-interpolated expand ~200ms ease-out | none | Purely informational disclosure — no haptic needed, motion alone communicates the state change |
| AddCardSheet rise | spring-gentle | none on open | Bottom sheets opening is a passive/expected transition, not a commit — haptic reserved for the actual submit |
| Add Card submit (success) | Sheet dismisses, new card row briefly fades from `green-50` → white (400ms) | `notificationAsync(Success)` | This is a genuine financial commit action — deserves the strongest appropriate confirmation in this day's vocabulary |
| Add Card submit (declined) | Stripe's native inline field error only — no extra app-level shake | `notificationAsync(Error)` | Avoid layering a second error animation on top of Stripe's own validated UI — one clear source of truth for card errors |
| Delete card swipe reveal | 1:1 direct manipulation | none until confirm | Direct manipulation is self-explanatory; no synthetic motion needed |
| Delete card confirm | Row collapses to 0 height, spring-gentle | `notificationAsync(Success)` | Confirms the destructive action completed |
| "Set as default" tap (non-swipe path) | Chip repositions/relabels instantly, 150ms cross-fade | `impactAsync(Light)` | Low-stakes, reversible, non-destructive — a light tap acknowledgment is enough |
| Logout confirm | No custom animation — native sheet dismiss + `router.replace` | none (native OS handles any system-level feedback) | This moment should feel decisive and clean, not decorated |
| Rate App tap | None — hands off entirely to native store review UI | none | Never intercept or decorate a system-owned UI surface |

**Zero bounce, zero overshoot, zero confetti-style motion appears anywhere on Day 37.** This is the most animation-restrained day in the entire build — intentionally, because it is the day closest to the user's money and identity.

---

## 8. State Design

### Loading
- Payment methods list: skeleton (`PaymentMethodCardSkeleton`) only if fetch exceeds 300ms, same delayed-guard pattern as Day 36
- Settings screen: preferences are near-instant from cache; no skeleton needed, screen renders with last-known values immediately and silently reconciles with server response
- Support screen: FAQ content can be bundled locally (static JSON) rather than fetched — **no loading state needed at all** if FAQ content ships with the app binary and is updated via OTA config, not a live API call

### Empty
- `PaymentEmptyState` as specified in 2.5
- Settings and Support screens have no meaningful "empty" state — they always render their full static structure

### Error
- Payment list fetch failure: inline retry row, rest of screen still usable
- Toggle update failure: silent optimistic rollback + small toast ("Couldn't update — please try again"), the switch visually flips back
- Add Card failure: Stripe's own error surface (see 2.4/7) — never build a redundant custom error toast on top of it
- Logout failure (rare — e.g., token revoke call fails): logout proceeds locally regardless (clear local state and navigate away) — **never block a user from logging out** just because a server-side revoke call failed; queue the revoke for background retry instead

---

## 9. Typography & Color Map (Full)

| Element | Font | Size/Weight | Color Token |
|---|---|---|---|
| Screen titles ("Payment Methods", "Settings", "Help & Support") | Poppins | SemiBold 22px | `textPrimary` |
| Section headers ("Preferences", "Notifications", "About") | Poppins | SemiBold 13px, uppercase-tracked | `textSecondary` |
| Card masked number `•••• 4242` | Inter | Medium 15px | `textPrimary` |
| Card expiry date | Inter | Regular 13px | `textMuted` |
| "Default" chip text | Jakarta | SemiBold 11px | `textOnGreen` on `green-100` bg |
| Settings row labels | Jakarta | Medium 15px | `textPrimary` |
| Segmented toggle option text | Jakarta | SemiBold 13px | `textOnGreen` (selected) / `textMuted` (unselected) |
| App version text | Inter | Regular 12px | `textMuted` |
| FAQ question | Jakarta | SemiBold 15px | `textPrimary` |
| FAQ answer | Jakarta | Regular 14px | `textSecondary` |
| Contact row labels (WhatsApp/Email/Call) | Jakarta | Medium 15px | `textPrimary` |
| "Add Card" / "Update" button label | Poppins | SemiBold 16px | `textOnGreen` |
| Logout destructive text | Jakarta | SemiBold 16px | `textDanger` |
| Secure payment notice text | Jakarta | Regular 12px | `textMuted` |

---

## 10. Spacing, Sizing & Touch Target Reference

| Element | Value |
|---|---|
| Screen horizontal padding | 16px |
| `PaymentMethodCard` height | 72px |
| Card gap in list | 10px |
| Swipe delete action width | 70px |
| `SettingsRow` height | 52px (matches standard input/button height for rhythm consistency) |
| Segmented toggle height | 40px, radius-pill, internal pill padding 4px |
| `ToggleRow` height | 52px |
| `AddCardSheet` snap point | 70% of screen height |
| Add Card button height | 52px, full-width minus 32px margin, radius-pill |
| FAQ item minimum tap height | 52px (question row), regardless of text length |

---

## 11. Accessibility Requirements (Specific to This Day)

- `PaymentMethodCard`: `accessibilityLabel` combines brand, masked number, and default status in one announcement (e.g., "Visa ending in 4242, default payment method")
- Toggle rows: `accessibilityRole="switch"`, `accessibilityState={{checked: true/false}}`, label read together with current state ("Booking updates, on")
- Segmented controls: `accessibilityRole="radiogroup"` with each option as `accessibilityRole="radio"`
- FAQ accordion: expand/collapse state announced via `accessibilityState={{expanded: true/false}}`; screen reader focus moves logically to the revealed answer text on expand
- Logout confirm: uses the **native** `ActionSheetIOS`/Android equivalent specifically because native components come with accessibility behavior already correct out of the box — this is a deliberate reason to avoid a fully custom sheet here
- Stripe `CardField`: relies on Stripe SDK's own built-in accessibility labeling — verified, not overridden
- All text respects `maxFontSizeMultiplier={1.3}`; verify masked card numbers and FAQ questions don't truncate awkwardly at max scale

---

## 12. Edge Cases to Explicitly Handle

- User deletes their only payment method while it's also the default → app must not crash on "no default card" state elsewhere (e.g., checkout screen); checkout should gracefully prompt "Add a card to continue" instead
- User attempts to delete the default card → soft inline confirm shown (per 2.3), distinct from deleting a non-default card
- Network drops mid-Stripe-submission → Stripe SDK's own timeout/error handling surfaces; app must not double-submit if the user taps "Add Card" again immediately (button must show a locked loading state during the request)
- User rapidly toggles a notification switch on/off multiple times before the first request resolves → debounce or queue toggle requests so only the **final** state is sent to the server, avoiding a race condition that could leave the UI and server out of sync
- User taps "Rate App" but has already reviewed → OS handles this silently (no custom message needed, per Section 4.4's "hands off entirely" rule)
- Logout tapped while offline → local state still clears fully and navigation still proceeds (per Section 8's error-handling rule); token revoke silently queued for next connectivity

---

## 13. Definition of Done — Day 37 Ship Gate

- [ ] Stripe add-card flow tested with real Stripe test cards — success case, generic decline, and insufficient-funds decline all verified
- [ ] Deleting the default card triggers the correct soft-confirm path; deleting a non-default card does not
- [ ] All settings toggles (language, currency, 4 notification preferences) persist to backend immediately with optimistic UI and confirmed rollback-on-failure behavior
- [ ] Language toggle changes visible app strings live, with no app restart required
- [ ] Logout clears: React Query cache, all three Zustand stores, secure-store tokens, and any relevant MMKV cache — verified by inspecting each layer post-logout
- [ ] Logout uses `router.replace`, confirmed the back gesture cannot re-enter an authenticated screen afterward
- [ ] FAQ accordion is single-expand-only, chevron rotation and height animation both confirmed smooth on a mid-range Android device
- [ ] FAQ ordering reviewed against actual support-ticket frequency data (or best current estimate) to correctly apply Serial Position Effect
- [ ] Rate App row calls the native store review API only — no custom pre-prompt modal exists anywhere in the flow
- [ ] Typography audit: Inter appears only on masked card numbers, expiry, and version string; every other text element on all three screens uses Jakarta or Poppins per the map in Section 9
- [ ] Zero bounce/overshoot animation present anywhere across all three screens (manual motion audit against Section 7)
- [ ] VoiceOver / TalkBack pass completed on all three screens plus the logout confirm sheet

---

*Tasklync — Day 37 Deep Build Plan*
*Calm screens for the things that matter most: your money, your preferences, your way out.*
