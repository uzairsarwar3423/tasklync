# Tasklync — Day 39 Deep Build Plan
## Offline Support & Network Resilience
> React Native + Expo Router · Reanimated 3 · Zustand · React Query · MMKV · NetInfo
> Fonts: **Poppins** (identity) · **Plus Jakarta Sans** (UI/body) · **Inter** (numbers/data)
> Senior RN/Expo build spec — file-level, component-level, interaction-level. No code, plan only.

---

## 0. Why This Day Matters (Design Rationale)

This is the only day in the entire roadmap with **no new screens**. It is a system-wide resilience layer that sits underneath every screen already built. The design mandate is singular: **the user must never be left guessing.** Two questions must always have an answer, visible without effort:

1. *Am I online right now?*
2. *Did the thing I just did actually happen?*

Every decision today serves those two questions. Nothing here is decorative — this is trust infrastructure, and it is judged by what it prevents (silent failures, lost cart items, duplicate bookings, dead-end blank screens), not by what it adds visually.

---

## 1. Full File & Folder Manifest

```
src/hooks/
├── useAppState.ts                       # foreground/background/inactive detection
├── useNetworkStatus.ts                  # NetInfo wrapper: isConnected, connectionType, isInternetReachable
├── useOfflineQueue.ts                   # Enqueue/dequeue/flush logic for failed mutations
└── useStaleDataLabel.ts                 # "Last updated Xm ago" computed label, ticking

src/components/feedback/
├── OfflineBanner.tsx                    # Slides down from top when disconnected
├── SyncIndicator.tsx                    # Small "Syncing..." pill after reconnect
├── StaleDataBadge.tsx                   # Small inline "Updated 4m ago" chip on cached content
└── MessageStatusIcon.tsx                # Clock → single-check → double-check chat status icon

src/services/storage/
├── local.storage.ts                     # (extend) MMKV cache: bookings, worker profiles, cart, location
├── requestQueue.storage.ts              # FIFO queue persisted to MMKV, with timestamps
└── idempotency.ts                       # generateIdempotencyKey(), keyed per mutation type

src/config/
├── queryClient.ts                       # (extend) persistQueryClient setup, per-query cache tuning
└── networkConfig.ts                     # Retry policy constants, queue TTL, reconnect debounce

src/providers/
└── NetworkProvider.tsx                  # Wraps app root; renders OfflineBanner/SyncIndicator, owns queue flush lifecycle

src/types/
└── network.types.ts                     # QueuedRequest, NetworkStatus, SyncState types

src/utils/
└── retryBackoff.ts                      # Exponential backoff helper for queue flush retries
```

**Total: 4 hooks · 4 components · 3 storage/service files · 2 config files · 1 provider · 1 types file · 1 util file**
**Zero new screens. This entire day is a cross-cutting layer.**

---

## 2. System Layer 1 — Connectivity Detection

### 2.1 `useNetworkStatus.ts`
- Subscribes to `NetInfo.addEventListener`, exposes three values: `isConnected` (device has a network interface), `isInternetReachable` (actual internet access, not just Wi-Fi association — critical distinction, since a phone can be Wi-Fi-connected to a router with no internet), and `connectionType` (wifi/cellular/none)
- Debounced by 500ms before flipping state — prevents the `OfflineBanner` from flickering on brief connectivity blips (elevator, tunnel, subway handoff) that resolve within a second
- Exposes a single derived boolean `isOffline` that everything else in the app consumes — one source of truth, never duplicated logic elsewhere

### 2.2 `useAppState.ts`
- Wraps `AppState` from React Native, exposes `appState: 'active' | 'background' | 'inactive'`
- On transition to `active` (app foregrounded): triggers a targeted refetch of *only* currently-mounted, stale queries — not a blanket refetch-everything, which would waste bandwidth and battery on a low-connectivity reconnect
- On transition to `background`: flushes any pending MMKV writes immediately (don't rely on the OS giving background time to finish async writes)

### 2.3 `NetworkProvider.tsx`
- Mounted once at the app root (inside `AppProviders.tsx`, alongside QueryClient/Stripe/Toast providers)
- Owns the lifecycle: listens to `useNetworkStatus`, renders `OfflineBanner` conditionally, triggers `useOfflineQueue`'s flush function on the offline→online transition, and renders `SyncIndicator` for the duration of that flush
- This is the **only** place queue-flush logic is triggered from — no screen-level code should ever manually trigger a flush, preventing race conditions from multiple simultaneous flush attempts

---

## 3. System Layer 2 — Cached-First Rendering

### 3.1 `queryClient.ts` (extended)
- `persistQueryClient` configured with an MMKV-backed persister (faster than AsyncStorage, synchronous reads)
- Per-query-type `staleTime`/`gcTime` tuning is **deliberately differentiated**, not a single global default:
  - Categories list: `staleTime: 1hr` (changes almost never)
  - Worker profiles: `staleTime: 5min`
  - Nearby workers: `staleTime: 30s` (already server-cached at 30s per the backend design — client should not be more "fresh-obsessed" than the server it's reading from)
  - Booking history: `staleTime: 5min`
  - Active/live bookings: `staleTime: 0` (always considered stale — this is the one category that must never show cached data as if it were current, since a worker's live status can change any second)
- Persisted cache is scoped to **exclude** anything containing payment tokens or sensitive PII — an explicit allowlist of query keys is persisted, not a blanket "persist everything" approach

### 3.2 `local.storage.ts` (extended)
- Adds three specific MMKV namespaces: `cache:bookings`, `cache:workerProfiles`, `cache:lastLocation`
- Cart already lives in MMKV via `cart.store.ts` (built earlier in the roadmap) — today's work here is only to confirm and harden its persistence (see Section 8 edge cases), not rebuild it
- Last-known GPS coordinates cached with a timestamp — Home screen reads this on cold start when a fresh GPS fix isn't yet available, preventing the classic "spinner forever because location permission dialog hasn't resolved yet" dead end

### 3.3 `StaleDataBadge.tsx` + `useStaleDataLabel.ts`
- Small, unobtrusive inline chip: "Updated 4m ago" — appears only on screens showing cached-while-offline content (worker profile, booking history, categories)
- `useStaleDataLabel` computes a human-readable relative time and **re-renders on an interval** (every 30s) so "4m ago" correctly becomes "5m ago" without requiring a screen refresh
- Never shown on live/real-time content (chat, active booking tracking) — showing a stale-data badge on a live map would be actively misleading

---

## 4. System Layer 3 — Optimistic Updates (Narrow, Justified Scope Only)

Optimistic updates are **not** applied universally — they are applied only where the cost of a wrong optimistic assumption is low and cheaply reversible. Today's work is to explicitly scope and implement exactly four cases:

| Action | Optimistic Behavior | Reversal Cost If Wrong |
|---|---|---|
| Mark notification as read | Instant checkmark/dim, sync in background | Trivial — worst case, notification re-appears as unread |
| Add/remove cart item | Instant list update, sync in background | Trivial — cart is local-first by design already |
| Chat message send | Shows immediately with `MessageStatusIcon` clock state | Low — message shows a retry option if send ultimately fails |
| Review submission | Optimistic success screen shown immediately | Low — silently retried; failure is rare and non-urgent to surface |

**Explicitly excluded from optimistic treatment today** (and this exclusion is itself a deliberate design decision, not an oversight): booking creation, payment confirmation, booking status transitions (accept/start/complete), and account deletion. These all require confirmed server state before the UI commits to a new state — the cost of being optimistically wrong on any of these is high (double bookings, false payment confirmations, users believing a job started when it didn't).

### 4.1 `MessageStatusIcon.tsx`
- Three states: `sending` (clock icon, `textMuted`), `sent` (single check, `textMuted`), `read` (double check, `textGreen` per the existing design system's read-receipt color)
- Transitions between states are a simple 100ms opacity cross-fade — **no scale, no bounce** — this is a frequent, low-drama status update that happens dozens of times per conversation, and any added motion per message would create visual noise at scale

---

## 5. System Layer 4 — Retry Queue

### 5.1 `requestQueue.storage.ts`
- FIFO queue, persisted to MMKV as a serialized array of `QueuedRequest` objects: `{ id, mutationType, payload, createdAt, idempotencyKey }`
- Queue is **not** a generic "retry anything" bucket — only specific, pre-approved mutation types are eligible for queuing (defined in `networkConfig.ts`): booking-adjacent writes and payment-adjacent writes that failed due to network error specifically (not validation errors — a 400 response should never be queued for blind retry, only network-layer failures like timeout/no-connection)

### 5.2 `idempotency.ts`
- Every queueable mutation generates a client-side idempotency key at the moment of the original user action (not at flush time) — this key travels with the request whether it succeeds immediately or gets queued and retried later
- Backend is expected to honor this key to prevent duplicate processing (this is a documented contract between the client team and backend team, called out explicitly as a cross-team dependency for this day)

### 5.3 `useOfflineQueue.ts`
- `enqueue(request)` — appends to the persisted queue
- `flush()` — triggered exclusively by `NetworkProvider` on reconnect, processes the queue **in strict FIFO order**, one request at a time (not parallel — parallel flushing of dependent actions, like "create booking" then "pay for booking," could otherwise race)
- Each queued item has a **5-minute expiry** from `createdAt` — on flush, expired items are silently dropped (not retried, not shown as failed) with a debug log only; a booking-creation request that's 6 minutes stale by the time connectivity returns is more likely to reflect a worker/slot state that's no longer valid, so silently replaying it risks a confusing failure downstream. Dropping it and letting the user re-initiate is the safer choice.
- Uses `retryBackoff.ts` for transient per-item failures during flush itself (e.g., reconnect happened but connection is still flaky) — exponential backoff, max 3 attempts per item before moving it to a `failedQueue` for manual user-visible retry (see 5.4)

### 5.4 Failed-After-Retry Handling
- If an item exhausts its 3 backoff attempts during flush, it is **not** silently dropped like an expired item — it's moved to a small "Couldn't sync" state, surfaced via a toast with a manual `[Retry]` action, because this represents a genuine ambiguous outcome the user should be aware of (distinct from an expired stale action, which is a clean, safe drop)

---

## 6. System Layer 5 — User-Facing Feedback

### 6.1 `OfflineBanner.tsx`
- Slides down from directly under the header, full-width, pinned for the entire duration of the offline state (does not auto-dismiss on a timer — only dismisses on actual reconnect)
- Copy: **"You're offline — some features may be limited"** — deliberately informational tone, `warning` color tokens (`#FEF3C7` background, not `danger` red) — being offline is a normal, expected condition, not an error state
- Does not block interaction with the rest of the screen — it's a persistent strip, not a modal takeover

### 6.2 `SyncIndicator.tsx`
- Appears only during an active queue flush, positioned as a small pill near the top of the screen (below the offline banner's now-vacated position)
- Text is **dynamic and count-based**: "Syncing 2 updates..." rather than a generic "Syncing..." — this satisfies the Goal-Gradient principle by giving the user a concrete sense of how much work remains, not just an indefinite spinner
- Fades out automatically 1.5s after the flush completes — no user action required to dismiss

---

## 7. UX Laws — Full Rationale Table

| Law | Applied Where | Concrete Reasoning |
|---|---|---|
| **Zero Anxiety Design** (house principle, elevated to a full law-level treatment today) | `OfflineBanner` persists for the entire offline duration; `SyncIndicator` explicitly confirms recovery | At every moment, the user has a definitive answer to "am I online" and "did my sync happen" — ambiguity is the actual enemy being designed against on this entire day |
| **Peak-End Rule** | The *end* of an offline episode is marked by a clear "synced" fade-out, not silence | Users remember how an experience concludes disproportionately — an offline period that resolves with visible confirmation feels resolved; one that resolves silently leaves lingering doubt ("did my message actually send?") |
| **Jakob's Law** | Offline banner pattern (slide-down top strip) matches Instagram, WhatsApp, and most major apps' identical convention | Zero learning curve — users already know what a top banner like this means the instant they see it, without reading the copy |
| **Goal-Gradient Effect** | `SyncIndicator` shows a concrete count ("Syncing 2 updates") rather than an indefinite spinner | A countable, shrinking task feels closer to completion than an ambiguous loading state — this reduces the perceived wait even if actual sync time is identical |
| **Recognition over Recall** | `MessageStatusIcon`'s clock/single-check/double-check icons reuse the exact universal messaging-app iconography (WhatsApp/iMessage convention) | Users recognize these icons' meaning instantly from years of exposure elsewhere — no new icon language needs to be learned |
| **Fitts's Law** | The manual `[Retry]` action on a failed-after-backoff queue item is a full tappable toast action, not a tiny icon | A failed sync retry is a meaningful, if infrequent, action — it deserves a target sized for confident, accurate tapping |

---

## 8. Microinteractions & Haptics — Complete Map (Minimal, Justified Set Only)

| Interaction | Motion Spec | Haptic | Why It Exists |
|---|---|---|---|
| `OfflineBanner` appear | Slide down, 200ms, **timing not spring** | none | This is a status strip, not a playful UI element — a spring here would feel inappropriately bouncy for what is essentially a warning light |
| `OfflineBanner` disappear (on reconnect) | Slide up, 200ms, timing | none | Symmetrical, calm exit matching the calm entrance |
| `SyncIndicator` appear/hold/disappear | Fade in (150ms) → hold 1.5s → fade out (150ms) | none | Purely informational, passive system feedback — never haptic-worthy since the user didn't just take an action |
| `MessageStatusIcon` state transitions | Opacity cross-fade only, 100ms, no scale | none | High-frequency, low-drama update (happens per message) — any added motion at this frequency becomes visual noise rather than signal |
| `StaleDataBadge` tick update ("4m ago" → "5m ago") | No animation — direct text swap | none | A ticking clock label should never draw the eye; motion here would be actively distracting from the content it's labeling |
| Queue flush failed-item toast | Standard toast slide-up (250ms) | `notificationAsync(Error)` (once, not per-item if multiple fail) | This is the one moment in this entire day that genuinely warrants a haptic — it represents a real, user-relevant outcome requiring their attention |
| Manual `[Retry]` tap on failed toast | Toast button press-scale (0.97→1.0) | `impactAsync(Light)` | Standard button-press acknowledgment |

**Zero haptics fire on any passive, system-driven connectivity event** — this is the strictest haptic-discipline day in the entire roadmap. Haptics are reserved exclusively for the one case (failed-after-retry) where the outcome is genuinely user-relevant and actionable.

---

## 9. State Design

### Loading
- Cold start with cached data available: render immediately from MMKV-persisted React Query cache, no spinner at all — this is the entire point of persistence
- Cold start with **no** cached data and **no** connectivity (first-ever launch, offline): show a dedicated "No internet connection" full-screen state (not a generic spinner that never resolves) with a `[Retry]` button that re-checks `useNetworkStatus`

### Empty
- Not applicable in the traditional sense today — but worth noting: an empty *queue* (nothing to sync) means `SyncIndicator` simply never renders on reconnect, which is itself the correct "empty state" behavior (absence, not a message saying "nothing to sync")

### Error
- Network-layer failure on a queueable mutation → silently enqueued, no user-facing error at the moment of failure (the whole point of the queue is to absorb this transparently)
- Non-network failure (validation error, 4xx) on a mutation attempted while offline-adjacent → **never queued**, surfaced immediately as a normal inline error, since retrying a validation failure blindly would just fail again
- Queue flush exhausts retries on an item → surfaced via the failed-toast pattern (Section 5.4 / 8)

---

## 10. Typography & Color Map (Full)

| Element | Font | Size/Weight | Color Token |
|---|---|---|---|
| `OfflineBanner` text | Jakarta | Medium 13px | `textWarning`-equivalent on `#FEF3C7` background |
| `SyncIndicator` text | Jakarta | Medium 12px | `textSecondary` |
| `StaleDataBadge` text ("Updated 4m ago") | Inter | Regular 11px | `textMuted` — *this is a time value, so Inter applies per the type system's numeric-data rule, even though it's embedded in a short informational phrase* |
| Failed-sync toast text | Jakarta | Regular 13px | `textDanger` |
| Failed-sync toast "Retry" action | Jakarta | SemiBold 13px | `textOnGreen`-equivalent / brand accent on the toast |
| "No internet connection" full-screen title | Poppins | SemiBold 20px | `textPrimary` |
| "No internet connection" subtitle | Jakarta | Regular 14px | `textSecondary` |
| `MessageStatusIcon` (icon only, no text) | — | — | `textMuted` (sending/sent) → `textGreen`-equivalent (read) |

---

## 11. Spacing, Sizing & Reference

| Element | Value |
|---|---|
| `OfflineBanner` height | 36px, full-width, positioned directly under header |
| `SyncIndicator` pill | Auto-width, 28px height, radius-pill, centered under offline-banner's vacated position |
| `StaleDataBadge` | Inline chip, 20px height, radius-sm, minimal padding |
| `MessageStatusIcon` size | 12px (matches chat timestamp text size for visual alignment) |
| Failed-sync toast | Standard app toast dimensions (matches existing `Toast.tsx` component from design system — no new toast variant needed, just new content) |
| "No internet connection" full-screen | Standard `ErrorState` layout reused from design system (icon 64px + title + subtitle + button) |

---

## 12. Accessibility Requirements (Specific to This Day)

- `OfflineBanner`: `accessibilityLiveRegion="polite"` so screen readers announce the offline state automatically the moment it appears, without requiring the user to navigate to it
- `SyncIndicator`: also `accessibilityLiveRegion="polite"`, announces "Syncing 2 updates" and then implicitly nothing further once it disappears (no need for a separate "sync complete" announcement — the absence is sufficient, avoiding over-announcing)
- `MessageStatusIcon`: each state has a corresponding `accessibilityLabel` ("Sending," "Sent," "Read") — the icon alone is not accessible without this
- `StaleDataBadge`: `accessibilityLabel="Content last updated 4 minutes ago"` — spoken in full, not abbreviated
- Failed-sync toast: uses the existing toast component's established accessibility pattern (already built earlier in the roadmap) — confirm it correctly interrupts to announce, since this is a genuinely important message

---

## 13. Edge Cases to Explicitly Handle

- App is killed entirely (not backgrounded) while items sit in the retry queue → queue must be **persisted to MMKV synchronously on every enqueue**, not just held in memory, so a full app kill does not silently lose queued actions; on next launch, `NetworkProvider` checks for a non-empty queue and attempts a flush immediately if connectivity is already present
- User has connectivity that flaps rapidly (in and out every few seconds — poor signal area) → the 500ms debounce in `useNetworkStatus` prevents the `OfflineBanner`/`SyncIndicator` from visibly flickering; additionally, `flush()` should not be re-triggered mid-flush if a fresh reconnect event fires while a previous flush is already in progress (a flush-in-progress lock is required)
- Two queued actions are logically dependent (e.g., "add cart item" then "create booking from cart") and the first fails/expires while the second does not → this specific ordering risk is exactly why FIFO strict ordering and the "drop expired, don't skip-and-continue silently" rule exist; if an earlier dependent action expires, any logically-dependent later action in the queue should also be evaluated for validity before executing (flag for backend-driven validation on flush, not blind client-side trust)
- User's cart was modified on a second device while this device was offline → on reconnect, cart sync should treat the **server** as source of truth for conflict resolution (last-write-wins is acceptable here specifically because cart state is low-stakes and easily user-correctable, unlike a booking or payment state)
- Airplane mode toggled on, then off within the same second (accidental toggle) → the 500ms debounce absorbs this cleanly; no banner should even appear for a sub-second blip

---

## 14. Definition of Done — Day 39 Ship Gate

- [ ] Airplane-mode test: app opens directly to a cached Home screen using persisted MMKV/React Query data, without crashing or hanging on a spinner
- [ ] Cart state confirmed to survive a full app kill + relaunch while offline (not just a background/foreground cycle)
- [ ] Queued mutations flush in strict FIFO order on reconnect — verified with a test sequence of 3+ queued actions
- [ ] Stale (>5 minutes) queued requests are dropped silently on flush, confirmed via a debug log, never blindly retried
- [ ] Idempotency keys generated at action-time (not flush-time) and correctly attached to every queueable mutation
- [ ] No duplicate bookings or payment attempts possible from retry logic — tested explicitly by forcing a network drop mid-mutation and reconnecting
- [ ] `OfflineBanner` and `SyncIndicator` both debounced correctly against rapid connectivity flapping (tested with airplane-mode toggling on/off within 1 second)
- [ ] Failed-after-retry queue items correctly surface a manual `[Retry]` toast rather than being silently dropped
- [ ] Zero haptic fires on any passive connectivity change — audited against Section 8
- [ ] `StaleDataBadge` never appears on live/real-time content (chat, active tracking) — audited screen-by-screen
- [ ] Typography audit: Inter used only for the stale-data time label; all banner/indicator/toast copy uses Jakarta or Poppins per Section 10
- [ ] Screen-reader pass confirms `OfflineBanner` and `SyncIndicator` both announce automatically via live regions without requiring manual navigation

---

*Tasklync — Day 39 Deep Build Plan*
*No new screens today — just the invisible floor every other screen stands on.*
