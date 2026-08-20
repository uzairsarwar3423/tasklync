# 📅 Tasklync — DAY 29 Deep Implementation Plan
## Chat: Media, Read Receipts, Edge Cases — Full Industry-Level Breakdown
> React Native Expo · Reanimated 3 · expo-image-picker/camera/manipulator · Socket.IO (Day 27 layer)
> Fonts: Poppins (brand) · Plus Jakarta Sans (UI) · Inter (data)
> No code — pure implementation specification

---

## 🎯 0. Why This Is the Day Most Teams Skip — and Why It's the Most Expensive to Skip

Day 28 made chat *work*. Day 29 makes chat *trustworthy*. The gap between those two is small in demo conditions and enormous in production: bad networks, large images, users scrolling back through history while new messages arrive, and bookings that end mid-conversation. None of this is glamorous, all of it generates support tickets if shipped incomplete.

The design brief for today isn't "add features" — it's **close every gap where a user could lose confidence in what they're looking at.** Every component built today answers one of three questions:

```
1. "Did my photo actually send?"          → ImageMessage (progress + retry)
2. "Did I miss something while scrolling?" → NewMessagesBanner
3. "Can I still talk to this person?"      → Archived state handling
```

---

## 🗂️ 1. Full File & Folder Plan

```
src/components/chat/
  ├── ImageMessage.tsx              blurhash placeholder + progress ring + retry affordance
  ├── NewMessagesBanner.tsx         "↓ New messages" pill, position-aware, auto-hides
  ├── ArchivedBanner.tsx            "This conversation is now archived" — fixed footer state
  └── MessageContextMenu.tsx        long-press → Copy (native-pattern action sheet)

src/services/api/
  └── chat.api.ts                    getMessages(cursor) · uploadMedia(bookingId, file) ·
                                      markRead(bookingId)          [extends Day 28's stub]

src/hooks/
  ├── useMediaUpload.ts               compress → upload → progress stream → retry logic
  └── useScrollPosition.ts            tracks "is user at bottom" to drive NewMessagesBanner

src/utils/
  └── imageCompression.ts             pure wrapper around expo-image-manipulator presets

(No new file for the media-picking flow — its logic lives inside ChatInput.tsx from Day 28,
 extended today, per the original spec: ActionSheet → camera/gallery → compress → upload)
```

**Rule enforced today:** every new component is additive to Day 28's chat screen, not a replacement. `chat.tsx` itself is not rewritten — `ImageMessage` slots into `MessageBubble`'s existing render-by-type switch, `NewMessagesBanner` mounts as a sibling overlay to the existing `FlatList`, and `ArchivedBanner` conditionally replaces `ChatInput` at the composition level in `chat.tsx`, not inside `ChatInput` itself (keeps the input component simpler — it doesn't need to know about booking status).

---

## 🕐 2. Morning Block (4h) — Media Pipeline + Failure Handling

### 2.1 `imageCompression.ts` — Build First
Pure wrapper, single responsibility: take a raw picked image URI, return a compressed URI within a fixed target size band (e.g. max 1280px longest edge, ~70% quality via `expo-image-manipulator`). No UI, no upload logic — purely `(uri) → Promise<compressedUri>`, independently testable.

### 2.2 Media Picking Flow — Extending `ChatInput.tsx`
```
Tap 📎  → ActionSheet: "Camera" | "Take Photo... / Choose from Gallery" | "Cancel"
  (exactly 2 real choices — Hick's Law carried over from Day 28)
On selection:
  1. Launch expo-camera or expo-image-picker
  2. Pass result URI through imageCompression.ts
  3. Immediately create a LOCAL optimistic ImageMessage entry (status: 'uploading',
     using the local URI directly as the placeholder image — no blurhash needed for
     the sender's own view, since they already have the real image on-device)
  4. Hand off to useMediaUpload for the actual network upload
```

### 2.3 `useMediaUpload.ts` — Upload + Progress + Retry Core
```
uploadImage(localUri, bookingId): 
  → POST multipart to chat.api.uploadMedia, with onUploadProgress callback
  → progress state (0–100) exposed per-message via a keyed map (messageId → progress)
  → on success: message status flips 'uploading' → 'sent', mediaUrl replaced with
    server URL, socket send fires (same reconciliation pattern as Day 28's text messages)
  → on failure (timeout, network drop, server error):
      message status flips to 'failed' — message stays in the thread at its
      original position, never removed, never silently disappears
  → retryUpload(messageId): re-attempts using the same locally-cached compressed URI,
    no need to re-pick or re-compress the image
```
This mirrors Day 28's optimistic-send pattern deliberately — same mental model, same reconciliation shape, just for a binary payload instead of text.

### 2.4 `ImageMessage.tsx` — Structural + State Build
```
Props: message (with status: 'uploading' | 'sent' | 'failed'), progress?
Render states:
  uploading → local thumbnail + circular progress ring overlay (see 3.4)
  sent      → final image (expo-image, cached, blurhash placeholder while remote loads
              for RECIPIENT's view — sender already has instant local render)
  failed    → dimmed thumbnail + centered retry icon button, tap → retryUpload()
Tap (sent state) → opens full-screen image viewer (existing pattern, reused not rebuilt)
```

**Fitts's Law checkpoint (morning):** the retry icon on a failed upload is a full 44px circular tap target centered directly over the thumbnail — not a small corner icon — because this is a moment where the user is already mildly frustrated (a photo didn't send); the recovery action must be the easiest possible tap on the whole screen, not an afterthought.

---

## 🕑 3. Afternoon Block (4h) — Scroll Awareness + Read Receipts Wiring + Archived State

### 3.1 `useScrollPosition.ts` — Position-Aware Hook
```
Tracks, via FlatList's onScroll (inverted list, so "bottom" = offset near 0):
  isAtBottom: boolean          — within a small threshold (~40px) of the newest message
  distanceFromBottom: number   — used only to decide banner visibility, not displayed
Exposes: onScroll handler to wire into chat.tsx's FlatList, plus isAtBottom for
NewMessagesBanner's visibility logic.
```

### 3.2 `NewMessagesBanner.tsx` — Wiring
```
Visibility rule:
  - New message arrives via socket AND isAtBottom === false
    → banner appears (see motion in 3.4)
  - New message arrives AND isAtBottom === true
    → NO banner — list auto-scrolls to reveal it directly (standard chat behavior,
      banner would be redundant noise if the user is already looking at the latest)
  - Banner tap → smooth scrollToOffset(0) on the inverted list + banner dismisses
  - Banner auto-dismisses if the user manually scrolls to bottom without tapping it
    (re-reads isAtBottom on every scroll event, not just on mount)
```
Banner shows a lightweight count if multiple messages arrived while scrolled up ("↓ 3 new messages") — this detail matters because a bare "↓ New messages" after 5 unseen messages under-communicates how much was missed, while an accurate count sets the right expectation before tapping.

### 3.3 Read Receipts — Full Wiring (extends Day 28's stub)
```
markRead(bookingId) fires:
  - on chat screen useFocusEffect (screen becomes focused)
  - on any new incoming message received WHILE the screen is focused
  - explicitly NOT fired while the app is backgrounded, even if the socket
    connection is technically alive (Day 27's layer keeps it connected, but "read"
    must reflect actual visual attention, not just connectivity)

On 'message_read' socket event:
  - update readBy[] on matching message ids in local state
  - ReadReceipt icon re-derives purely from readBy[] (same single-source-of-truth
    rule established Day 28 — no separate boolean anywhere)
```

### 3.4 `MessageContextMenu.tsx` — Long-Press Copy
```
Long-press on any text bubble (image bubbles excluded — copy doesn't apply)
  → native-style context menu: "Copy" (single option today — no "Forward,"
    "Delete," "Report" yet; Hick's Law again: one clear action, zero decision cost)
  → Clipboard.setStringAsync(message.content)
  → brief toast confirmation ("Copied") — text only, no icon needed, dismisses in ~1.5s
```

### 3.5 Archived Room Handling
```
chat.tsx reads booking.status (already available from Day 26's useBookingDetail,
reused here rather than re-fetched):
  status === 'COMPLETED' | 'CANCELLED' | 'DISPUTED' (any terminal state)
    → ChatInput is NOT rendered
    → ArchivedBanner renders in its place, fixed at the bottom, same position
      the input occupied — this positional consistency matters: the user's eye
      already knows where to look for "what can I do here," and finding an
      explanation exactly there (instead of the input just vanishing) closes
      the loop cleanly instead of leaving a confusing empty gap.
```

### 3.6 Motion Pass — the 2 Microinteractions

**(a) Image upload progress**
```
Circular progress ring overlay on the local thumbnail, 0→100%, withTiming, linear
easing (matches real upload progress reporting, which is inherently non-uniform —
a spring here would visually lie about upload speed). No bounce, no color change
until completion, at which point the ring simply fades out as the final image
crossfades in (200ms fade, not a springy reveal — this is a data-accuracy moment,
not a celebration moment).
```

**(b) New messages banner**
```
Appear: opacity 0→1 + scale 0.9→1.0, spring-snappy (quick, decisive — it needs to
register in peripheral vision immediately since the user's attention is elsewhere,
scrolled up in history)
Disappear: fades on tap-triggered scroll completion, or fades if the user scrolls
to bottom manually — no lingering, no delay-then-fade; the moment the condition
that justified it is no longer true, it's gone.
```

---

## 🧠 4. UX Laws — Applied Line-by-Line

| Law | Exact Application on This Day |
|---|---|
| **Zero Anxiety Design** | A failed upload never vanishes — it stays exactly where it would have appeared, dimmed, with a retry button in the identical position a successful image would occupy. The user never has to ask "where did my photo go?" because it never actually goes anywhere. |
| **Recognition over Recall** | Read receipts remain pure icon-state (✓ / ✓✓ / ✓✓ blue) with zero accompanying text — carried forward from Day 28, now fully wired to live data instead of just structurally present. |
| **Fitts's Law** | `NewMessagesBanner` is a full-width tappable pill (not a small floating icon) because it appears during active, sometimes urgent mid-conversation moments — the user shouldn't need precision aim to act on it. Retry buttons on failed uploads are similarly oversized (44px+) for the same reason: recovery actions get generous targets, always. |
| **Jakob's Law** | Long-press → "Copy" uses the exact OS-native text-interaction pattern every user already knows from every other text surface on their phone — nothing new to learn, and critically, nothing *new invented* that could conflict with the OS's own long-press-to-select gesture. |
| **Hick's Law** | Media picker offers exactly 2 real choices (Camera / Gallery). Context menu offers exactly 1 action (Copy) today. Both are deliberately minimal rather than exhaustive — every additional option in either menu adds decision latency with no proportional benefit at this stage. |
| **Peak-End Rule (again suppressed, consistent with Day 28)** | No component today is designed as a "peak" moment — even upload success is a quiet crossfade, not a celebration, because photo-sharing in a transactional service chat is routine, not an emotional milestone (unlike Day 30's arrival moment). |

---

## 🔤 5. Complete Typography Map

| Element | Font | Weight / Size | Reasoning |
|---|---|---|---|
| "↓ 3 new messages" banner | Jakarta | SemiBold 13 | Short, urgent UI label — needs to read instantly |
| "This conversation is now archived" | Jakarta | Regular 12, muted (#94A3B8) | Informational, low-emphasis explanatory text |
| Upload progress "%" (if numerically shown) | Inter | Medium 11 | Any numeric value defaults to Inter |
| "Copied" toast confirmation | Jakarta | Medium 13 | Standard toast microcopy weight, consistent with system toasts elsewhere |

---

## 🎬 6. Microinteraction Ledger (exactly 2 — tightly scoped, consistent with the system's restraint)

| # | Trigger | Motion | Type | Why It Exists |
|---|---|---|---|---|
| 1 | Image upload in progress | Circular progress ring, `withTiming`, linear, 0→100% | Functional | Answers "is this actually uploading right now" with an honest, non-decorative progress signal |
| 2 | New message arrives while scrolled up | Banner appears opacity+scale spring-snappy; disappears on resolution | Functional | Closes the "did I miss something" gap the moment it becomes true, and closes itself the moment it's no longer relevant |

**Explicitly excluded today:**
- No animation on the ArchivedBanner appearing — it renders in its final state immediately, because a booking transitioning to a terminal status is not something the user is watching happen live in most cases (they open a completed chat later); animating an entrance for content that's simply "already true" on load would be motion without a real event behind it.
- No animation on the long-press context menu beyond the OS's own native menu presentation — this is intentionally left to the platform, not custom-built, both for consistency with system gestures and to avoid re-implementing something iOS/Android already do correctly.
- No bounce/overshoot anywhere in today's build — every motion added is `withTiming` or a restrained `spring-snappy`, never `spring-bouncy`; today's failure-recovery and awareness features are inherently lower-stakes-feeling moments than Day 28's core messaging loop, and the motion budget reflects that.

---

## ✅ 7. Definition of Done (testable checklist)

```
MEDIA UPLOAD
□ Selecting Camera vs Gallery both correctly route through imageCompression.ts before upload
□ Compressed image stays under target size band without visible quality loss at chat-bubble scale
□ Upload progress ring accurately reflects real upload percentage (not a fake/simulated timer)
□ Killing network mid-upload → message flips to 'failed', stays in thread at original position
□ Retry after failure re-uses the cached compressed URI (no re-pick, no re-compress required)
□ Successful upload crossfades from local thumbnail to final remote image with zero flash/jump

SCROLL AWARENESS
□ Scrolled to bottom + new message arrives → list auto-scrolls, NO banner appears
□ Scrolled up in history + new message arrives → banner appears with accurate unread count
□ Tapping banner → smooth scroll to bottom + banner dismisses correctly
□ Manually scrolling to bottom without tapping banner → banner dismisses on its own

READ RECEIPTS
□ markRead fires on screen focus and on new-message-while-focused; confirmed NOT
  firing while app is backgrounded despite an active socket connection
□ ReadReceipt icon state updates live via 'message_read' without requiring screen refresh

ARCHIVED STATE
□ Booking status COMPLETED/CANCELLED/DISPUTED → ChatInput replaced by ArchivedBanner
  in the exact same layout position (no visual gap or jump)
□ No send attempt possible in archived state (input genuinely unmounted, not just disabled)

CONTEXT MENU
□ Long-press on text bubble → Copy works correctly, confirmed via paste elsewhere
□ Long-press on image bubble → correctly does NOT show a text-copy option

VISUAL
□ Every text element matches the typography map exactly
□ Retry and banner tap targets both meet 44px+ effective touch area
```
