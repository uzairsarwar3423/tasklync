import { Message, MessageRenderItem, ReadReceiptStatus } from '../types/chat.types';

/**
 * Formats a timestamp into a human-readable date divider label
 * e.g. "Today", "Yesterday", "Monday, Aug 12", "Dec 25, 2025"
 */
export function formatDateDividerLabel(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();

  // Create date-only midnight timestamps for accurate comparison
  const dateMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;

  const diffDays = Math.round((todayMidnight - dateMidnight) / oneDayMs);

  if (diffDays === 0) {
    return 'Today';
  }
  if (diffDays === 1) {
    return 'Yesterday';
  }
  if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Derives read receipt status from message state and read_by array
 */
export function deriveReadReceiptStatus(message: Message, currentUserId: string): ReadReceiptStatus {
  if (message.status === 'failed') return 'failed';
  if (message.status === 'sending') return 'sending';

  // If someone other than the current user has read this message
  const hasOtherReader = (message.read_by || []).some((uid) => uid && uid !== currentUserId);
  if (hasOtherReader || message.status === 'read') {
    return 'read';
  }

  if (message.status === 'delivered') {
    return 'delivered';
  }

  return 'sent';
}

/**
 * Pure transformation: flat chronological Message[] -> grouped inverted MessageRenderItem[]
 *
 * Consecutive messages from the same sender within 60s are grouped together.
 * Date dividers are injected at day boundaries.
 * Output is returned in INVERTED order (index 0 = newest message at bottom of screen)
 * so it maps 1:1 to an inverted FlatList.
 */
export function groupMessagesForInvertedList(
  messages: Message[],
  currentUserId: string
): MessageRenderItem[] {
  if (!messages || messages.length === 0) {
    return [];
  }

  // 1. Sort messages in strict chronological order (oldest to newest)
  const sorted = [...messages].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const chronologicalItems: MessageRenderItem[] = [];
  let lastDateKey = '';

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i]!;
    const currentDate = new Date(current.created_at);
    const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`;

    // Inject date divider at day boundary
    if (dateKey !== lastDateKey) {
      chronologicalItems.push({
        type: 'date_divider',
        id: `divider-${dateKey}`,
        label: formatDateDividerLabel(current.created_at),
        timestamp: current.created_at,
      });
      lastDateKey = dateKey;
    }

    // System messages render as centered pill
    if (current.type === 'system') {
      chronologicalItems.push({
        type: 'system',
        id: current.id,
        content: current.content,
        timestamp: current.created_at,
      });
      continue;
    }

    const prev = i > 0 ? sorted[i - 1] : null;
    const next = i < sorted.length - 1 ? sorted[i + 1] : null;

    const isOutgoing = current.sender_type === 'customer' || current.sender_id === currentUserId;

    // Check if consecutive same-sender within 60 seconds
    const prevTime = prev ? new Date(prev.created_at).getTime() : 0;
    const currTime = new Date(current.created_at).getTime();
    const nextTime = next ? new Date(next.created_at).getTime() : 0;

    const isSameSenderAsPrev = prev && prev.type !== 'system' && prev.sender_id === current.sender_id;
    const isWithin60sOfPrev = isSameSenderAsPrev && currTime - prevTime <= 60000;

    const isSameSenderAsNext = next && next.type !== 'system' && next.sender_id === current.sender_id;
    const isWithin60sOfNext = isSameSenderAsNext && nextTime - currTime <= 60000;

    // First in run: not grouped with previous
    const isFirstInGroup = !isWithin60sOfPrev;
    // Last in run: not grouped with next
    const isLastInGroup = !isWithin60sOfNext;

    // Avatar shown only on the first incoming message of a run
    const showAvatar = !isOutgoing && isFirstInGroup;
    // Timestamp shown on the first message or if standalone
    const showTimestamp = isFirstInGroup || isLastInGroup;

    const readReceiptStatus = isOutgoing ? deriveReadReceiptStatus(current, currentUserId) : 'sent';

    chronologicalItems.push({
      type: 'message',
      id: current.id,
      message: current,
      isFirstInGroup,
      isLastInGroup,
      showTimestamp,
      showAvatar,
      isOutgoing,
      readReceiptStatus,
    });
  }

  // 2. Return in reverse/inverted order (newest at index 0) for inverted FlatList
  return chronologicalItems.reverse();
}
