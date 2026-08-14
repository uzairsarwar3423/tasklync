# 📅 Tasklync — DAY 28 Deep Implementation Plan
## Chat Screen: UI + Messages — Full Industry-Level Breakdown
> React Native Expo · Reanimated 3 · Socket.IO (via Day 27 layer) · React Query
> Fonts: Poppins (brand) · Plus Jakarta Sans (UI) · Inter (data)
> No code — pure implementation specification

---

## 🎯 0. Why This Screen Earns the Week's Highest Animation Budget

Chat is the screen users open **most frequently** during an active booking — often 10–20 times in a single job. It is also the screen most directly compared, subconsciously, against WhatsApp and iMessage, apps the user has each opened thousands of times. Any deviation from that grammar doesn't read as "different," it reads as "broken" or "slow."

The design brief for today: **borrow the grammar completely, spend the animation budget only where it confirms something real happened.** This is the one screen this week where slightly more motion is earned — not because chat is more important than tracking, but because chat has more *discrete state changes per minute* (send, receive, type, read) than any other screen in the app.

```
The single question every element on this screen answers:
  "Did that message actually go through?"
  → Every microinteraction today either answers this directly (send/arrival)
    or supports the surrounding context needed to trust the answer (grouping, receipts).
```

---

## 🗂️ 1. Full File & Folder Plan

```
app/booking/[id]/
  └── chat.tsx                            SCREEN — inverted FlatList orchestrator

src/components/chat/
  ├── MessageBubble.tsx                   incoming/outgoing bubble, grouping-aware
  ├── MessageTimestamp.tsx                floating date divider ("Today", "Jan 15")
  ├── SystemMessage.tsx                   centered pill ("Booking accepted 🎉")
  ├── TypingIndicator.tsx                 3 staggered bouncing dots
  ├── ChatInput.tsx                       expanding input + attach + animated send
  ├── ChatHeader.tsx                      avatar + name + live status line
  └── ReadReceipt.tsx                     ✓ / ✓✓ / ✓✓(blue) inline icon, reused per bubble

src/hooks/
  ├── useChat.ts                          REST history + socket join + optimistic send
  └── useTypingIndicator.ts               debounced emit + auto-clear on inactivity

src/services/api/
  └── chat.api.ts                         getMessages(bookingId, cursor) — REST history only
                                           (send/typing/read handled via Day 27's chat.socket.ts)

src/utils/
  └── messageGrouping.ts                  pure fn: raw messages[] → grouped render list
                                           (injects date dividers + "isFirstInGroup" flags)

src/types/
  └── chat.types.ts                       Message, MessageType, SenderType, ChatRoom types
```

**Rule enforced today:** `chat.tsx` never touches raw socket calls or raw message arrays directly — it only renders whatever `useChat()` returns. All grouping/date-divider logic lives in the pure function `messageGrouping.ts`, kept fully separate from rendering so it can be unit-tested without mounting a single component.

---

## 🕐 2. Morning Block (4h) — Structure + Static UI

### 2.1 `messageGrouping.ts` — Build First (everything renders from this)
Pure transformation, no side effects:
```
Input:  Message[]  (flat, chronological)
Output: RenderItem[]  where each item is one of:
  { type: 'date_divider', label }
  { type: 'system', content }
  { type: 'message', message, isFirstInGroup, showTimestamp, showAvatar }

Grouping rule: consecutive messages from the same sender within 60s of each other
  → only the FIRST message in that run shows avatar + timestamp; the rest sit tight.
```
Because this is a pure function, the inverted `FlatList` in `chat.tsx` only ever maps over its output — no grouping logic ever touches JSX.

### 2.2 `chat.tsx` — Screen Shell
```
KeyboardAware wrapper
  → ChatHeader (fixed top)
  → FlatList (inverted, data = messageGrouping(messages))
      renderItem switches on item.type:
        'date_divider' → MessageTimestamp
        'system'       → SystemMessage
        'message'      → MessageBubble
  → TypingIndicator (conditionally rendered above ChatInput)
  → ChatInput (fixed bottom, above keyboard)
```
Skeleton state: while REST history is loading, render 4–5 shimmer bubble placeholders alternating left/right — never a blank white screen on chat open (Zero Anxiety Design, consistent with Day 26/27's stance).

### 2.3 `ChatHeader.tsx` — Structural Build
```
[← back]  [Avatar 36px]  Worker Name          [🟢 Online / Offline status]
```
Status line pulls from worker presence data (available via booking detail or a lightweight presence event) — not a new subsystem today, just surfaced here.

### 2.4 `MessageBubble.tsx` — Structural Build
```
Props: message, isFirstInGroup, showTimestamp, isOutgoing
Layout:
  Incoming: [Avatar (if isFirstInGroup)] [White bubble, left-aligned]
  Outgoing: [Green bubble, right-aligned]  (no avatar ever — user knows it's them)
  Timestamp: only rendered if showTimestamp === true, small text below bubble
  ReadReceipt: only rendered on outgoing bubbles, bottom-right corner of last-in-group
```

### 2.5 `ChatInput.tsx` — Structural Build
```
[📎 attach]  [TextInput — grows 40px→100px max]  [Send button]
Send button: disabled visual state when input is empty (no color logic wired yet — afternoon)
```

**Fitts's Law checkpoint (morning):** `📎` attach icon and send button both sized to minimum 44px effective touch area via `hitSlop`, verified at build time — the same discipline as Day 26, not revisited later as a fix.

---

## 🕑 3. Afternoon Block (4h) — Data Wiring + Socket Integration + Motion

### 3.1 `useChat.ts` — The Core Hook
```
Responsibilities:
  1. Load message history via chat.api.getMessages (React Query, cursor-paginated)
  2. On mount: chat.socket.joinRoom(bookingId); on unmount: leaveRoom(bookingId)
     — uses Day 27's useSocketEvent under the hood, so no manual on/off pairing here
  3. Subscribe to 'message_received' → append to local message state
     — dedupe check: if message.id already exists (echo of our own optimistic send),
       reconcile instead of duplicating (see 3.4)
  4. sendMessage(content, type, mediaUrl?):
     - generates a temporary client-side id + status: 'sending'
     - appends immediately to local state (optimistic)
     - emits via chat.socket.sendMessage
     - on server ack/echo: replace temp message with server version (same position,
       no visual jump) and flip status to 'sent'
  5. Typing: exposes notifyTyping() which internally debounces emit calls via
     useTypingIndicator (separate hook — see 3.2), so useChat itself stays simple
```

### 3.2 `useTypingIndicator.ts` — Debounced Emit + Auto-Clear
```
notifyTyping() called on every keystroke
  → emits 'typing_start' at most once per 3s window (debounced), not on every keystroke
  → automatically emits 'typing_stop' after 2s of no further calls (inactivity timeout)
  → also emits 'typing_stop' immediately on send
```
This prevents flooding the socket with an event per keystroke — a scale concern, not just a UX one, since this runs across every active chat room simultaneously at production volume.

### 3.3 Read Receipts Wiring
```
On chat screen focus (useFocusEffect) AND on new incoming message while focused:
  → call markRead(bookingId) via REST (chat.api.ts)
On 'message_read' socket event received:
  → update matching message(s) in local state: add current user to readBy[]
  → ReadReceipt component re-derives icon state purely from readBy[] contents,
    never from a separate boolean flag (single source of truth)
```

### 3.4 Optimistic Send — Reconciliation Detail
This is the trickiest correctness point of the day, worth calling out explicitly:
```
Client sends message with tempId: "temp_abc123"
Server responds via socket echo with real message.id: "msg_9f2..."
useChat matches the echo to the pending optimistic entry by:
  (senderId + content + type + a short time window)
  → replaces the temp entry in-place (same array index) rather than appending a
    second bubble, so the message never visibly "jumps" or duplicates on screen.
If no echo arrives within a timeout (~8s) → message flips to a 'failed' state
  with a retry affordance inline (small red icon + tap-to-retry, not a separate modal).
```

### 3.5 Motion Pass — the 3 Microinteractions

**(a) Message arrival**
```
New item enters the (inverted) list → translateY 12→0 + opacity 0→1, spring-gentle, 200ms
Applies to BOTH incoming and outgoing messages, including the optimistic-send moment —
consistency here matters: the user shouldn't be able to tell "sent" motion apart from
"received" motion, because both mean the same thing to them: "this message now exists."
```

**(b) Typing indicator**
```
Appears: 3 dots, each with a translateY bounce (0 → -4 → 0), 300ms per cycle,
100ms stagger between dot 1/2/3 (creates the "wave" read pattern)
Disappears: instantly on 'typing_stop' event or on message arrival replacing it —
no fade-out animation on exit, because lingering it even 200ms after typing has
genuinely stopped reads as a stale/laggy indicator rather than an accurate one.
```

**(c) Send button color transition**
```
Empty input → gray (#CBD5E1 icon on transparent/gray bg)
Text entered → green (#16A34A bg, white icon)
withTiming, 150ms, linear — explicitly NOT withSpring, because color interpolation
cannot spring in Reanimated; this is the one documented exception to the "always
spring for interactive elements" rule from the design system, and it's called out
here so it isn't "fixed" incorrectly later by someone applying the rule blindly.
```

---

## 🧠 4. UX Laws — Applied Line-by-Line

| Law | Exact Application on This Screen |
|---|---|
| **Recognition over Recall** | Outgoing vs incoming is coded entirely through position (left/right) + color (white/green) — no "You:" label anywhere. After the very first message a user sends, the pattern is recognized instantly for the rest of the conversation, session after session. |
| **Jakob's Law** | Inverted list, bubble grouping under 60s, ✓/✓✓ read receipts, typing dots — every one of these is lifted directly from WhatsApp/iMessage. This is the screen where inventing a "better" pattern would actively cost speed, because the user's muscle memory is already trained elsewhere. |
| **Serial Position Effect** | `ChatInput` is permanently fixed at the bottom — the last visual element the eye reaches and the last physical element the thumb reaches, which correctly matches "send" being the final action in every interaction loop on this screen. |
| **Hick's Law** | The `📎` attach flow offers exactly 2 choices (Camera / Gallery) in the follow-up ActionSheet, not a long menu with "Document," "Location," "Contact," etc. Fewer real choices = near-zero decision latency in a moment (mid-conversation) where speed matters most. |
| **Fitts's Law** | Send button and attach icon both meet 44px effective touch targets via hitSlop; the entire input row sits in the reliably-reachable bottom thumb zone, never requiring a reach toward the top of the screen mid-typing. |
| **Peak-End Rule (deliberately suppressed here)** | Unlike Day 30, chat intentionally has **no** designated "peak" animation — every message matters roughly equally, so no single message send/receive is given outsized visual weight. Consistency of motion across all 3 microinteractions is the correct choice here, not an escalating one. |

---

## 🔤 5. Complete Typography Map

| Element | Font | Weight / Size | Reasoning |
|---|---|---|---|
| Worker name (header) | Poppins | SemiBold 15 | Person's name → brand voice |
| "🟢 Online" status line | Jakarta | Regular 12 | Small UI status text |
| Message body text | Jakarta | Regular 15 | Conversational body content |
| Timestamp under bubble | Inter | Regular 11 | Time = data, always Inter |
| Date divider ("Today") | Jakarta | Medium 12 | UI label, not data itself |
| System message text | Jakarta | Medium 12 | Neutral system-voice microcopy |
| Read receipt (no text, icon only) | — | — | ✓/✓✓ icons, no font needed |
| Input placeholder text | Jakarta | Regular 15 | Matches message body weight for visual continuity while typing |

---

## 🎬 6. Microinteraction Ledger (exactly 3 — the week's highest, still tightly bounded)

| # | Trigger | Motion | Type | Why It Exists |
|---|---|---|---|---|
| 1 | Any message enters the list (sent or received) | translateY 12→0 + opacity fade, spring-gentle, 200ms | Functional | Confirms a message now exists in the thread — the single most-repeated confirmation on this screen, so it must be fast and consistent, never showy |
| 2 | Other party is actively typing | 3-dot staggered bounce, loops only while active | Functional | Signals "a reply is coming" in real time — disappears instantly when no longer true, so it never misleads |
| 3 | Text entered/cleared in input | Send button gray↔green, `withTiming` 150ms | Functional | Confirms the send action is now available — the one correct use of timing over spring in this system |

**Explicitly excluded today, even though it's the week's highest-motion screen:**
- No bounce/overshoot on the send button itself when tapped (kept to a simple press-scale via existing Button component pattern, nothing new invented for chat specifically).
- No animation on ReadReceipt icon transitions (✓ → ✓✓ → ✓✓ blue) — these update silently; animating every receipt state change across a long conversation would create visual noise disproportionate to their importance.
- No entrance stagger for historical messages on initial chat open — history loads and renders instantly as a block; stagger is reserved for genuinely new, live arrivals only, never for content the user is scrolling back into.

---

## ✅ 7. Definition of Done (testable checklist)

```
STRUCTURE
□ chat.tsx contains no direct socket.on/off calls and no raw message-array logic
□ messageGrouping.ts is independently unit-testable with zero component mounting

DATA & SYNC
□ REST history loads correctly on screen open, paginates on scroll-to-top (cursor-based)
□ Live messages via socket append correctly with zero duplicate entries
  (specifically test: send a message, confirm exactly ONE bubble appears, not two)
□ Optimistic send reconciles correctly with server echo — verified with throttled
  network (message should not "jump" position or flicker on reconciliation)
□ Failed send (timeout, no echo within ~8s) shows retry affordance correctly

GROUPING & DISPLAY
□ Consecutive same-sender messages within 60s show avatar+timestamp only on the first
□ A message sent >60s after the previous one always shows its own avatar+timestamp
□ Date dividers appear correctly at day boundaries, not duplicated within the same day

TYPING & RECEIPTS
□ Typing indicator appears within ~1s of the other party typing, disappears within
  ~2s of them stopping (verified against the debounce/timeout values, not guessed)
□ Read receipts update live via 'message_read' event without requiring a screen refresh
□ markRead fires on screen focus and on new-message-while-focused, not on every render

VISUAL
□ Every text element matches the typography map exactly
□ Outgoing/incoming bubbles are visually distinguishable at a glance with zero labels
□ Attach and send buttons meet 44px effective touch target via hitSlop

MOTION
□ Message arrival animation is identical in feel for sent vs received messages
□ Typing indicator dot stagger timing matches spec (100ms between dots)
□ Send button color transition uses withTiming, confirmed NOT using withSpring
```
