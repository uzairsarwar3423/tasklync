# 📅 Tasklync — DAY 27 Deep Implementation Plan
## WebSocket Service + Socket Provider — Full Industry-Level Breakdown
> React Native Expo · Socket.IO Client · Zustand · Reanimated 3
> Fonts: Poppins (brand) · Plus Jakarta Sans (UI) · Inter (data)
> No code — pure implementation specification

---

## 🎯 0. Why This Layer Matters More Than It Looks

Day 27 ships **zero new screens**. That is deliberate. This is the day the app earns the right to feel "alive" on Days 28–30 — chat, typing indicators, live tracking all sit on top of this one connection layer. If this layer is wrong, every real-time feature above it will feel broken in ways that are hard to diagnose later (silent drops, duplicate listeners, memory leaks, reconnect storms).

The design brief for today isn't visual — it's **trust through invisibility**. The best possible outcome is that a user never once thinks about the socket connection. The only time it should surface in the UI is when a delay is long enough to actually matter.

```
The one question this layer must always answer correctly:
  "If my network blips for 2 seconds, does the user notice anything at all?"
  → The answer must be NO.
```

---

## 🗂️ 1. Full File & Folder Plan

```
src/services/socket/
  ├── socket.service.ts          singleton: connect/disconnect/emit/on/off/isConnected
  ├── chat.socket.ts             chat-domain event wrappers (join_room, send_message…)
  └── location.socket.ts         tracking-domain event wrappers (used by Day 30)

src/store/
  └── socket.store.ts            Zustand: isConnected, lastConnectedAt, reconnectAttempts,
                                  connectionQuality ('good' | 'degraded' | 'offline')

src/providers/
  └── SocketProvider.tsx         top-level lifecycle owner — mounted once in AppProviders

src/hooks/
  ├── useSocket.ts               context accessor → returns socketService instance
  ├── useSocketEvent.ts          generic subscribe/auto-unsubscribe wrapper (typed)
  └── useAppState.ts             (reused/extended) foreground/background detection

src/components/feedback/
  └── ConnectionBanner.tsx       the ONE visible artifact of this entire day

src/config/
  └── socket.config.ts           URL, namespace, reconnection tuning constants
```

**Rule enforced today:** `socket.service.ts` is a **singleton module**, not a hook and not a component — it must survive across every screen without being remounted. Screens and hooks only ever *read* its state or *call* its methods; they never own its lifecycle. Ownership of connect/disconnect lives exclusively in `SocketProvider`.

---

## 🕐 2. Morning Block (4h) — Core Service + Store

### 2.1 `socket.config.ts` — Constants First
Single file holding every tunable number, so reconnection behavior can be adjusted without touching logic code:
```
SOCKET_URL                 from env
RECONNECT_DELAYS_MS        [1000, 2000, 4000, 8000, 16000, 30000]  (caps at 30s)
MAX_RECONNECT_ATTEMPTS     Infinity (never give up silently — see 3.3)
BANNER_SHOW_THRESHOLD_MS   3000   (how long a disconnect must last before UI reacts)
HEARTBEAT_INTERVAL_MS      25000
```

### 2.2 `socket.service.ts` — Connection Core
Public API surface (method names + intent, not implementation):
```
connect(token: string): void
  → creates socket.io-client instance, auth in handshake, attaches internal listeners
disconnect(): void
  → graceful close, clears all internal listeners, resets singleton state
emit(event, data): void
  → guards against emitting while disconnected (queues or silently drops per event type)
on(event, handler): () => void
  → returns an unsubscribe function directly (this is what makes useSocketEvent trivial)
off(event, handler): void
isConnected(): boolean
```
Internal responsibilities not exposed publicly:
- Exponential backoff reconnection scheduling (reads from `socket.config.ts`)
- Updates `socket.store.ts` on every connect/disconnect/reconnect_attempt event
- Heartbeat ping to detect "zombie" connections (socket looks open but is dead)

### 2.3 `socket.store.ts` — State of Truth for UI
```
State shape:
  isConnected: boolean
  lastConnectedAt: Date | null
  reconnectAttempts: number
  connectionQuality: 'good' | 'degraded' | 'offline'

Actions:
  setConnected() / setDisconnected() / incrementReconnectAttempt() / resetAttempts()
```
`connectionQuality` is a derived-but-stored value: `good` on stable connection, `degraded` after 1–2 reconnect attempts within a short window (flaky network), `offline` after exceeding a attempt threshold. This three-tier state is what lets `ConnectionBanner` show different tone/copy instead of a binary connected/disconnected flicker.

### 2.4 `chat.socket.ts` — Domain Wrapper (built, not consumed yet)
Thin wrapper around `socket.service` for chat-specific events, so Day 28's `useChat` hook never touches raw event strings:
```
joinRoom(bookingId)
leaveRoom(bookingId)
sendMessage({ bookingId, type, content, mediaUrl? })
startTyping(bookingId) / stopTyping(bookingId)
```
This indirection matters for scale: if the event name or payload shape ever changes on the backend, exactly one file changes, not every chat component.

---

## 🕑 3. Afternoon Block (4h) — Lifecycle, Hooks, and the One UI Moment

### 3.1 `SocketProvider.tsx` — Lifecycle Rules
This is the most important file of the day because it encodes *when* connect/disconnect actually happens — get this wrong and every downstream feature inherits the bug.

```
Lifecycle Rules (exact order matters):
  1. On mount: if auth token already present (app reopened, session restored) → connect immediately
  2. On login success (auth.store token becomes non-null) → connect
  3. On logout (token cleared) → disconnect immediately, reset socket.store to initial state
  4. On app foreground (useAppState) → if token present AND not connected → reconnect
  5. On network restore (NetInfo listener) → if token present AND not connected → reconnect
  6. On app background → DO NOT disconnect proactively; let the OS/socket timeout handle it
     naturally, so a quick app-switch (e.g. checking a notification) doesn't trigger a
     full reconnect cycle for something that lasted 2 seconds
```
Point 6 is a deliberate anti-pattern avoidance: naively disconnecting on every backgrounding event causes reconnect storms and wastes the exact backoff logic built in the morning.

### 3.2 `useSocket.ts` — Context Accessor
Simple contract: any component calling `useSocket()` gets back the same singleton `socketService` instance, scoped through React Context purely so components don't import the service module directly (keeps testing/mocking clean, not because the instance itself is React state).

### 3.3 `useSocketEvent.ts` — The Leak-Prevention Hook
This hook exists because manual `socket.on/off` pairing inside every component is where memory leaks are born in real-world apps. Contract:
```
useSocketEvent<T>(eventName: string, handler: (payload: T) => void, deps: DependencyList)
  → internally calls socket.on() on mount / dep-change
  → returns nothing; internally calls the unsubscribe function on unmount / dep-change
  → components NEVER call socket.on/off directly, ever, anywhere in the app
```
This single hook is what makes Day 28's chat screen and Day 30's tracking screen safe to write quickly without each one re-solving the same leak risk.

### 3.4 `ConnectionBanner.tsx` — The One Visible Artifact
```
Render logic:
  - connectionQuality === 'good'      → render nothing (null)
  - connectionQuality === 'degraded'  → no banner yet (still silent — Jakob's Law)
  - disconnected AND elapsed > BANNER_SHOW_THRESHOLD_MS (3000ms)
        → render banner: "Reconnecting…"
  - reconnected after banner was shown
        → banner briefly flips to "Back online" (1.5s) then dismisses itself
```
The "Back online" micro-state matters: if a banner appeared, disappearing it silently can make a user wonder if it's *actually* fixed. A brief positive confirmation closes that loop — this is the only place today where the system proactively reassures rather than just going quiet.

### 3.5 Where `ConnectionBanner` Lives
Mounted once, globally, inside the root layout (`app/_layout.tsx`) above all screen content as a fixed-position overlay — never re-implemented per-screen. Any screen can be affected by connection state; only one instance should ever exist.

---

## 🧠 4. UX Laws — Applied Line-by-Line

| Law | Exact Application in This Layer |
|---|---|
| **Jakob's Law** | Reconnection with exponential backoff and a delayed, low-key banner matches WhatsApp/Instagram/every chat app's behavior. A user who has never read a spec still "knows" what a brief "Reconnecting…" pill means because they've seen it everywhere else. |
| **Zero Anxiety Design** (system principle, not a numbered law but foundational here) | The 3-second threshold before *any* UI appears means normal micro-blips (elevator, tunnel, app-switch) are completely invisible. Anxiety is only introduced when a delay is long enough to be genuinely worth knowing about. |
| **Recognition over Recall** | `ConnectionBanner` uses plain-language state ("Reconnecting…", "Back online") rather than a technical status code or icon-only signal that would require the user to remember what it means. |
| **Peak-End Rule (inverted, deliberately)** | This is the one part of the system where we actively *suppress* a potential "peak" (a jarring reconnect flicker) rather than create one — because an infrastructure hiccup should never be a memorable moment. The absence of drama here IS the design win. |
| **Fitts's Law** | Not directly applicable (no new tap targets today) — noted as intentionally out of scope; the banner itself is non-interactive by design, so it never competes for a tap. |

---

## 🔤 5. Complete Typography Map

| Element | Font | Weight / Size | Reasoning |
|---|---|---|---|
| "Reconnecting…" | Jakarta | Medium 12 | Transient UI microcopy, not a headline |
| "Back online" | Jakarta | Medium 12 | Same tier as above — consistency, not escalation |

No Poppins or Inter usage today — there are no headlines, names, or numeric data anywhere in this layer. Keeping this table short is itself a signal that today's scope is correctly infrastructure-only, not UI-driven.

---

## 🎬 6. Microinteraction Ledger (exactly 1 — deliberately minimal)

| # | Trigger | Motion | Type | Why It Exists (and why nothing else does) |
|---|---|---|---|---|
| 1 | Disconnection persists beyond 3000ms | Banner slides down from top, `translateY -20→0`, spring-gentle | Functional | The only real state change a user might need to know about. No sound, no haptic — this is background infrastructure, not a moment worth a body-level interruption. |

**Explicitly excluded today:**
- No pulsing "connecting" dot anywhere in the tab bar or header — that would surface technical state the user doesn't need moment-to-moment.
- No haptic on connect/disconnect/reconnect — haptics are reserved for user-initiated or emotionally significant events (Day 26/30's success moments), not passive network state.
- No animation on the "Back online" → dismiss transition beyond a simple fade (functional only, sub-200ms, not spring-based) — it should feel like it "cleans itself up," not like it's celebrating.

---

## ✅ 7. Definition of Done (testable checklist)

```
CONNECTION LIFECYCLE
□ Fresh login → socket connects with valid JWT in handshake auth payload
□ Logout → socket disconnects immediately; socket.store resets to initial state
□ Force-quit and reopen app with valid session → auto-connects on mount, no user action needed

RECONNECTION
□ Kill network (airplane mode) for 10s, restore → auto-reconnects without app restart
□ Backoff timing verified: attempts roughly follow 1s→2s→4s→8s… sequence (log-inspected)
□ Backgrounding app for <5s (quick switch) → NO reconnect cycle triggered on return
□ Backgrounding app for >2min → reconnects correctly on foreground return

MEMORY / LEAKS
□ useSocketEvent: mount/unmount a component subscribed to an event 20x in a row →
  confirm exactly one active listener at any time (no accumulation)
□ No console warnings for duplicate listener registration during Fast Refresh in dev

UI
□ ConnectionBanner renders nothing during normal operation (verified via layout inspector,
  not just visually — element should not exist in tree when connected)
□ Banner appears only after the 3000ms threshold, never on the first drop
□ "Back online" state shows briefly and self-dismisses without user interaction

STORE
□ connectionQuality transitions correctly: good → degraded → offline under simulated
  repeated short disconnects vs one long disconnect
```
