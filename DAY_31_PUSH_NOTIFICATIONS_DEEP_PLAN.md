# 🔔 DAY 31 — Push Notifications Infrastructure
### Deep Implementation Plan · Principal React Native Engineer Level
> Scope: Full push pipeline for Tasklync User App (Expo SDK 52, Expo Router, Zustand, TanStack Query)
> This is a **plumbing day** — the goal is a correct, race-condition-free, restart-safe notification system that every later screen (chat, booking, review) can depend on without re-solving lifecycle problems.

---

## 0. Why This Day Is Architected the Way It Is

Push notifications touch **five independent lifecycles** that most teams get wrong by conflating them:

1. **Permission lifecycle** — asked once, can be revoked in OS settings anytime, must be re-checked on every app foreground.
2. **Token lifecycle** — Expo push token can rotate (reinstall, OS update, device restore). Stale tokens silently fail server-side; there's no client-side error for this.
3. **App state lifecycle** — foreground / background / killed each deliver notifications through a **different code path** in Expo (`addNotificationReceivedListener` vs `addNotificationResponseReceivedListener` vs `getLastNotificationResponseAsync`).
4. **Auth lifecycle** — a token must never be registered before the user is authenticated (no `userId` to attach it to), and must be **deregistered on logout** (or a stale device keeps receiving another user's notifications — a real privacy bug).
5. **Navigation lifecycle** — Expo Router isn't guaranteed mounted yet when a killed-app notification tap fires; deep-linking must queue until the router is ready.

Getting these five lifecycles cleanly separated is the actual engineering work of Day 31. Everything below is designed around **not conflating them**.

---

## 1. Complete File Tree for the Day

```
app/
  └── _layout.tsx                              # (touched) mount NotificationProvider here

src/
  ├── services/
  │   └── notifications/
  │       ├── push.service.ts                  # low-level Expo Notifications wrapper
  │       ├── notification-router.ts            # payload → route resolver (pure function)
  │       ├── notification-categories.ts         # iOS categories + Android channel definitions
  │       └── notification-queue.ts             # NEW — holds a pending deep link until router is ready
  │
  ├── providers/
  │   └── NotificationProvider.tsx              # lifecycle owner, mounted once at root
  │
  ├── hooks/
  │   ├── usePushRegistration.ts                # registers/unregisters token with backend
  │   └── useNotificationPermission.ts          # NEW — permission status + request flow
  │
  ├── store/
  │   └── notification.store.ts                 # NEW — Zustand: permissionStatus, pushToken, lastError
  │
  ├── components/
  │   └── feedback/
  │       ├── InAppBanner.tsx                   # foreground banner UI
  │       └── InAppBannerProvider.tsx            # NEW — imperative show()/hide() controller + queue
  │
  ├── services/api/
  │   └── notification.api.ts                   # registerFcmToken(), unregisterFcmToken()
  │
  └── utils/
      └── deepLink.ts                           # parses payload, normalizes to a router path string

app.config.ts                                    # (touched) expo-notifications plugin config
eas.json                                          # (touched) confirm push credentials profile
```

**8 new/touched files beyond the original list** — `notification-queue.ts`, `useNotificationPermission.ts`, `notification.store.ts`, `InAppBannerProvider.tsx`, plus config files. These exist because without them, two specific bugs are guaranteed: (a) killed-app notification taps get silently dropped if the router isn't mounted yet, (b) multiple banners fired in quick succession (e.g. 3 chat messages arriving together) will visually stack/overlap without a queue.

---

## 2. Config Layer (build before any code)

### `app.config.ts`

**Responsibility:** Declare the `expo-notifications` config plugin, icon/color for Android notification icon, and iOS `UIBackgroundModes` if needed for silent pushes later.

- Set Android notification icon (must be a flat white silhouette per Android design guidelines — a colored icon will render as a white square, a very common first-time mistake).
- Set Android notification color to brand green `#16A34A` (tint applied to the small icon).
- Confirm `googleServicesFile` (android) and `usesAppleSignIn`/APNs entitlement path are correctly referenced — required for FCM/APNs to function in production builds (works differently in Expo Go vs dev client vs standalone build; this must be a **dev client or standalone build test from day one**, Expo Go cannot deliver real push in SDK 52+).

### `eas.json`

**Responsibility:** Confirm the build profile used for QA has `"channel"` set and that push notification credentials (APNs key, FCM server key) are already generated via `eas credentials`. This is infrastructure, not app code — but Day 31 is blocked without it, so it's listed explicitly as a pre-flight check, not an afterthought discovered at 4pm.

---

## 3. `src/store/notification.store.ts` (build first — everything else reads from this)

**Responsibility:** Single source of truth for notification-related state that multiple unrelated parts of the app need to read (bell badge, settings screen, provider, registration hook).

**State shape to hold:**
- `permissionStatus`: `'undetermined' | 'granted' | 'denied'`
- `pushToken`: `string | null`
- `tokenRegisteredForUserId`: `string | null` — **critical field**, this is what prevents re-registering the same token repeatedly and what allows detecting "token belongs to a different user than who's logged in now" on account switch.
- `lastRegistrationError`: `string | null`

**Why a store instead of local component state:** Permission status needs to be readable from the Profile/Settings screen ("Notifications are off — tap to enable" banner) without prop-drilling through the provider tree. Zustand keeps this a single flat read with no context re-render cascade.

---

## 4. `src/services/notifications/notification-categories.ts`

**Responsibility:** Pure configuration — no logic. Defines:

- **Android notification channels** (required on Android 8+, or all notifications fall into a generic default channel with no user control):
  - `booking` channel — high importance, sound + vibration, used for accept/start/arrival events.
  - `chat` channel — default importance, sound only, used for `new_message`.
  - `payment` channel — high importance, sound, used for receipts/refunds.
  - `marketing` channel — low importance, no sound — reserved for future promotional pushes so users can mute those independently without muting booking alerts.
- **iOS notification categories** (used later for actionable notifications like "Accept/Decline" buttons directly on the lock screen — not required Day 31 but the category *registration* must happen now, because iOS categories can only be registered once at app init, not lazily).

**Why this is its own file and not inlined in the provider:** Channels/categories are declarative config that QA and design need to review independently (e.g. "should chat notifications vibrate?" is a product decision, not an engineering one) — keeping it isolated makes it reviewable in a PR diff without touching lifecycle code.

---

## 5. `src/services/notifications/push.service.ts`

**Responsibility:** The only file in the codebase allowed to import `expo-notifications` directly. Everything else in the app talks to notifications through this service — this is a deliberate **adapter pattern** so that if the team ever migrates off Expo's push service to a raw FCM/APNs SDK (common once an app scales past Expo's push service rate limits), only this one file changes.

**Functions this file exposes (behavior, not code):**

- `requestPermission()` — wraps `Notifications.requestPermissionsAsync()`, but **only ever called after** the pre-permission explainer screen confirms intent (enforced by the hook layer, not this service — this service just does the OS call and returns the resulting status).
- `getPermissionStatus()` — read-only check, used on every app foreground to detect if the user revoked permission in OS Settings mid-session (this is the #1 missed edge case in most push implementations — apps assume permission state never changes after the first ask).
- `getExpoPushToken()` — wraps `Notifications.getExpoPushTokenAsync()`, requires the `projectId` from `app.config.ts`/`eas.json`; must run **after** permission is confirmed granted, never speculatively.
- `registerNotificationChannels()` — applies the Android channel definitions from `notification-categories.ts`; called once at cold start, before any notification could theoretically arrive.
- `addForegroundListener(callback)` / `addResponseListener(callback)` — thin wrappers returning the subscription object so the provider can clean up listeners on unmount (prevents duplicate-fire bugs from React Fast Refresh in dev, a very common source of "why did I get 2 banners for 1 notification" confusion during development).
- `getLastNotificationResponse()` — wraps `Notifications.getLastNotificationResponseAsync()`, specifically for the **killed-app cold-start tap** case — this is the one path developers most often forget, because it doesn't fire through the normal listener at all; it must be manually polled once at startup.

**Error handling built into this layer:**
- Token fetch failure (network, misconfigured `projectId`) is caught and surfaces as `lastRegistrationError` in the store — never thrown uncaught, since a push registration failure must **never** crash or block app usage. Push is an enhancement, not a hard dependency for app function.

---

## 6. `src/services/notifications/notification-queue.ts`

**Responsibility:** Solve the "router not ready yet" race condition.

**Scenario this exists for:** App was fully killed. User taps a push notification. iOS/Android cold-launches the app. `App.tsx`/root layout begins mounting. `getLastNotificationResponseAsync()` resolves with the tap payload **before** Expo Router has finished registering its route tree — calling `router.push()` at this exact moment either silently no-ops or throws, depending on timing (a real, reproducible race, not a theoretical one).

**Design:** A tiny in-memory queue (not persisted — it only needs to survive milliseconds of app boot, not app restarts) with two operations:
- `enqueue(path)` — called by the provider the instant a cold-start deep link is detected, before the router is confirmed ready.
- `flush(routerReadyCallback)` — called once from the root layout's `useEffect` after Expo Router reports its navigation state is ready; drains the queue and performs the actual `router.push()`.

**Why not just retry with a `setTimeout`:** A timeout-based retry is a race condition with an extra step — it can still fire too early on a slow device or too late (visible flash of the wrong screen) on a fast one. A queue drained by an actual "router ready" event is the deterministic version of the same idea.

---

## 7. `src/utils/deepLink.ts`

**Responsibility:** Pure function — takes a raw notification `data` payload, returns a normalized route string. No side effects, no navigation calls, fully unit-testable in isolation without mocking Expo Router or Notifications at all.

**Behavior:**
- Reads `data.type` and `data.bookingId` (or other relevant IDs) from the payload.
- Maps against the route table (the same map documented in the original plan: `booking_accepted → /booking/[id]/detail`, etc).
- **Unknown/unmapped `type`** must resolve to a safe fallback (`/notifications` — the notification center) rather than throwing or returning `null` — a backend team shipping a new notification `templateKey` without a matching client route update should never crash the app; it should just land the user somewhere sensible.
- Validates that required IDs are actually present in the payload before building a path (a malformed payload with `type: 'booking_accepted'` but missing `bookingId` must also fall back safely, not build a path like `/booking/undefined/detail`).

---

## 8. `src/providers/NotificationProvider.tsx`

**Responsibility:** The single lifecycle owner. Mounted once, at the root layout, above everything else that could need notification state (so it's guaranteed initialized before any screen renders). This is the most complex file of the day — it's an orchestrator, not a UI component.

**What it owns, in order of execution:**

1. **On mount (app cold start):**
   - Calls `registerNotificationChannels()` — synchronous config, always safe to run immediately regardless of auth state.
   - Calls `getPermissionStatus()` — read-only, updates the store. Does **not** request permission here — that only happens from the explicit user-triggered explainer flow elsewhere in the app (Day 5's screen), this provider only *reads* current status.
   - Calls `getLastNotificationResponse()` — checks for the cold-start tap case; if present, resolves the path via `deepLink.ts` and calls `notification-queue.enqueue()`.

2. **Subscribes to two listeners** (and stores their subscription references for cleanup):
   - **Foreground listener** — fires while app is open and a notification arrives. This is routed to `InAppBannerProvider.show()`, **not** directly navigated — a foreground notification should never yank the user off whatever screen they're actively using; it shows as a banner they can choose to tap.
   - **Response listener** — fires when the user taps a notification while app is backgrounded (not killed). This one **does** navigate immediately via the deep link resolver, since a tap while backgrounded is an explicit "take me there" action, unlike a passive foreground arrival.

3. **On auth state change (subscribes to the auth store):**
   - When a user logs in: triggers `usePushRegistration`'s registration flow (described below).
   - When a user logs out: triggers deregistration **before** clearing auth tokens (deregistration call needs a valid auth header to identify which token to remove server-side — this ordering matters and is a common bug: clearing the token first makes the deregister call unauthenticated and it silently fails, leaving a ghost registration on the backend).

4. **On app foreground (AppState listener):**
   - Re-checks permission status (catches "user revoked in OS Settings" case).
   - If permission was previously granted but token registration never completed (e.g. app was killed mid-registration), retries registration — this makes the system **self-healing** rather than requiring the user to somehow "fix" a failed background registration themselves.

5. **Cleanup on unmount:** removes both listener subscriptions and the AppState listener — in production this provider never unmounts (it's root-level), but this matters enormously in development with Fast Refresh, where a naive implementation causes duplicate-firing listeners that make the whole feature look broken when it isn't.

**What it deliberately does NOT own:** actual navigation logic (delegated to `deepLink.ts` + router), actual UI rendering of the banner (delegated to `InAppBannerProvider`), actual API calls (delegated to `usePushRegistration`). This provider is pure orchestration/glue — every piece it coordinates is independently testable.

---

## 9. `src/hooks/useNotificationPermission.ts`

**Responsibility:** The **only** place in the app allowed to trigger `push.service.requestPermission()`. Exists as a separate hook from `usePushRegistration` because permission and registration are different concerns with different triggers — permission is a one-time (or rarely re-asked) user consent action typically fired from the Day 5 explainer screen or from a Settings toggle; registration is a technical follow-up that should happen automatically once permission exists, with no user awareness required.

**Exposes:**
- `status` (read from store)
- `request()` — calls the explainer-gated permission request, updates the store with the result.

**Why separating this from the provider matters:** The explainer screen (Day 5) needs to trigger a permission request from a **user tap**, which is a component-level event — it cannot reach into the root provider's internals. This hook is the clean public API surface for that one specific screen's needs, without exposing the provider's full orchestration internals.

---

## 10. `src/hooks/usePushRegistration.ts`

**Responsibility:** Owns the actual **server-sync** of the push token — this is the piece that talks to `notification.api.ts`.

**Behavior:**
- `register()`:
  1. Reads current `pushToken` and `tokenRegisteredForUserId` from the store.
  2. If token is already registered for the currently logged-in user, **no-ops** — this idempotency check is what prevents a network call firing on every single app foreground.
  3. Otherwise calls `getExpoPushToken()`, then `POST /users/me/fcm-token` via `notification.api.ts`.
  4. On success, updates `tokenRegisteredForUserId` in the store to the current user's ID — this is what makes the no-op check on step 2 work correctly on the *next* call.
  5. On failure: does **not** throw to the caller in a way that blocks login/app usage — logs to `lastRegistrationError`, and relies on the provider's "retry on next foreground" self-healing behavior described above.
- `unregister()`:
  1. Calls a deregistration endpoint (or `POST /users/me/fcm-token` with a null/empty token, depending on what the backend team confirms as the deregistration contract — **this needs a 5-minute conversation with backend before writing any code**, since `ALL_API_ENDPOINTS.md` only documents the register call, not an explicit unregister one).
  2. Clears `pushToken` and `tokenRegisteredForUserId` from the store regardless of API success/failure — client-side state must not stay stale even if the server call fails, since the far worse outcome (another user's device staying subscribed to the previous user's notifications) must be prevented client-side no matter what.

**Retry strategy:** Exponential backoff is **overkill** for this specific call — it's not a high-frequency or high-volume endpoint. A single retry on next app foreground (already provided by the provider's self-healing check) is sufficient and avoids introducing a queueing library for a one-line POST.

---

## 11. `src/services/api/notification.api.ts`

**Responsibility:** Thin HTTP layer, no business logic — consistent with every other `*.api.ts` file in the codebase (`user.api.ts`, `booking.api.ts`, etc., per the existing `MICROSERVICES_STRUCTURE.md` conventions).

**Functions:**
- `registerFcmToken(token: string)` → `POST /users/me/fcm-token`
- `unregisterFcmToken()` → contract TBD with backend (see note above)

**Why this stays this thin:** Idempotency logic, retry logic, and store updates all live in the hook layer (`usePushRegistration`), not here — this file should remain trivially mockable for hook-level unit tests without needing to fake network timing/retry behavior.

---

## 12. `src/components/feedback/InAppBannerProvider.tsx`

**Responsibility:** Solves the "3 messages arrive in 2 seconds" stacking problem via a simple FIFO queue with a single visible banner slot.

**Behavior:**
- Exposes an imperative `show(notification)` method (called by `NotificationProvider`'s foreground listener) — imperative rather than prop-driven because notifications arrive from an event listener outside the React render cycle, not from a parent passing props down.
- Internally holds a queue array in state; only ever renders **one** `InAppBanner` at a time — the currently showing one.
- When the visible banner's exit animation completes (auto-dismiss timeout OR user swipe), it dequeues the next item if one exists, with a short stagger delay (e.g. 300ms gap) so two banners never visually overlap or feel like a jarring instant swap.
- Caps the queue at a small max (e.g. 3) — if 10 chat messages arrive in a burst, showing 10 sequential banners is worse UX than showing the first, then collapsing the rest into a single "+9 more messages" banner. This collapsing rule is a product decision worth flagging explicitly rather than silently deciding it in code.

### `InAppBanner.tsx` (presentational only)

**Responsibility:** Pure UI — receives a single notification object and `onDismiss`/`onPress` callbers, renders avatar/icon + title + body, handles its own entrance/exit animation and swipe gesture. Has **zero knowledge** of the queue, the provider, or the API layer — fully reusable/testable/storybook-able in isolation.

---

## 13. Root Layout Wiring (`app/_layout.tsx`)

**Change required:** Mount `NotificationProvider` and `InAppBannerProvider` near the top of the provider tree — specifically **inside** the auth provider (needs to know current user) but **outside** the tab/stack navigators (needs to be alive regardless of which screen is currently active).

**Also required here:** The router-ready flush call for `notification-queue.ts` — Expo Router exposes a way to detect when its navigation state is ready; this is the single line that connects the cold-start deep link queue (item 6 above) to actual navigation, and it belongs at the root layout level since that's the only place with guaranteed access to a mounted, ready router.

---

## 14. Sequence Walkthroughs (what actually happens, step by step)

### A. Fresh login, permission not yet asked
```
User logs in
  → AuthProvider updates auth store
  → NotificationProvider's auth-change subscriber fires
  → Does NOT auto-request permission (must go through explainer screen first)
  → usePushRegistration.register() is called defensively but no-ops
    (no permission = no token = nothing to register yet)
  → Later: user reaches the Day-5 explainer screen, taps "Allow Notifications"
  → useNotificationPermission.request() → OS prompt → granted
  → NotificationProvider detects permission change (via store subscription or explicit call)
  → usePushRegistration.register() now succeeds → POST /users/me/fcm-token
```

### B. Foreground notification arrival
```
Notification arrives while app open
  → push.service foreground listener fires
  → NotificationProvider receives it
  → Calls InAppBannerProvider.show(notification)
  → Banner slides in, auto-dismisses after 4s OR user swipes/taps
  → If tapped: deepLink.ts resolves path → router.push() directly
    (router is guaranteed ready here, app is already running — no queue needed)
```

### C. Backgrounded app, user taps OS notification
```
User taps notification from notification tray (app backgrounded, not killed)
  → push.service response listener fires
  → NotificationProvider resolves path via deepLink.ts
  → router.push() directly (app already booted, router already mounted)
```

### D. Killed app, user taps OS notification (the hard case)
```
User taps notification (app fully killed)
  → OS cold-launches app
  → Root layout begins mounting
  → NotificationProvider mounts → calls getLastNotificationResponse()
  → Resolves payload → deepLink.ts → path
  → notification-queue.enqueue(path)   [router not confirmed ready yet]
  → ... app finishes booting, Expo Router reports navigation ready ...
  → root layout's ready-callback fires → notification-queue.flush()
  → router.push(path) executes, now safely
```

### E. Logout
```
User taps Log Out
  → usePushRegistration.unregister() called FIRST (needs valid auth header)
  → Store's pushToken/tokenRegisteredForUserId cleared regardless of API outcome
  → THEN auth tokens cleared, secure storage wiped
  → Navigate to (auth)/welcome
```

---

## 15. Edge Cases Checklist (must be verified, not assumed)

| Edge case | Expected behavior |
|---|---|
| User denies permission at OS prompt | `permissionStatus = 'denied'` stored; app continues normally; no repeated auto-prompting (only re-askable via manual Settings deep link from a future Settings screen) |
| User revokes permission in OS Settings mid-session | Detected on next app foreground via `AppState` check; store updates; no crash, no stale "granted" assumption |
| Token rotates (reinstall / OS restore) | New token differs from stored one → registration logic (idempotency check keyed on token value, not just presence) re-registers automatically |
| Two rapid logins/logouts (account switching on same device) | Deregister-before-clear ordering (section 10) prevents the previous user's token lingering registered |
| Notification arrives with unknown `type` | `deepLink.ts` fallback → `/notifications`, never a crash or blank navigation |
| Notification payload missing expected ID field | Same safe fallback, validated before path construction |
| 5+ notifications arrive in a burst while foregrounded | `InAppBannerProvider` queue caps and collapses rather than stacking 5 banners |
| App killed while a registration API call was in flight | No persisted "in progress" state to corrupt; on next launch, idempotency check simply re-attempts cleanly |
| Dev environment: Fast Refresh remounting the provider | Listener cleanup on unmount (section 8) prevents duplicate-fire bugs that only appear in dev, not prod |
| Expo Go (SDK 52+) | Real push does not function in Expo Go — this must be explicitly called out to the team so nobody spends an hour debugging "why don't I get notifications" in the wrong environment; QA for this day requires a dev client or EAS build |

---

## 16. Security Considerations

- The push token itself is not secret, but the **association** between a token and a `userId` is sensitive — deregistration on logout (section 10/14E) is a privacy requirement, not a nice-to-have, since a shared/resold device that isn't deregistered would leak the previous user's booking/chat notifications to whoever uses the device next.
- The `POST /users/me/fcm-token` call must go through the standard authenticated API client (existing `client.ts` axios instance with interceptors) — never a bespoke unauthenticated call, so a token can never be registered against an arbitrary `userId` supplied by the client.

---

## 17. Testing Plan for the Day

**Cannot be tested in Expo Go — requires a dev client or EAS internal build, on a real device (push does not reliably work on simulators/emulators for iOS, and is inconsistent on Android emulators without Google Play services configured).**

Manual QA matrix to run before marking the day done:

| Scenario | iOS | Android |
|---|---|---|
| Fresh install → explainer → allow → token registered | ☐ | ☐ |
| Fresh install → explainer → deny → app functions normally, no crash | ☐ | ☐ |
| Foreground notification → banner shows → tap routes correctly | ☐ | ☐ |
| Foreground notification → swipe dismiss works | ☐ | ☐ |
| Background app → tap OS notification → correct deep link | ☐ | ☐ |
| Killed app → tap OS notification → correct deep link after cold boot | ☐ | ☐ |
| Revoke permission in OS Settings → return to app → state updates | ☐ | ☐ |
| Log out → log in as different account → old token not receiving new user's pushes (verify server-side) | ☐ | ☐ |
| Android notification channels appear correctly in system settings (separately mutable) | — | ☐ |
| 3 chat notifications sent rapidly → banner queue behaves correctly, no overlap | ☐ | ☐ |

---

## 18. Build Order for the Day (sequence to actually write things in)

Writing these in the wrong order causes the most common Day-31 time loss (building UI before the state it depends on exists). Recommended order:

1. `app.config.ts` / `eas.json` config + confirm push credentials exist (blocks everything else)
2. `notification.store.ts` (everything reads/writes this)
3. `notification-categories.ts` (pure config, no dependencies)
4. `push.service.ts` (depends only on Expo SDK + categories file)
5. `deepLink.ts` (pure function, no dependencies — easiest to unit test in isolation first)
6. `notification-queue.ts` (pure, small)
7. `notification.api.ts` (thin HTTP layer)
8. `usePushRegistration.ts` + `useNotificationPermission.ts` (depend on service + api + store)
9. `NotificationProvider.tsx` (orchestrates everything built above)
10. `InAppBanner.tsx` + `InAppBannerProvider.tsx` (UI layer, last — depends on nothing but is depended on by the provider)
11. Root layout wiring
12. Manual QA matrix (section 17)

---

*Day 31 — Push Notifications Infrastructure — Deep Implementation Plan*
*Tasklync · React Native Expo · Principal Engineering Standard*
