import {
  NotificationItem,
  NotificationListItem,
  NotificationHeaderItem,
  NotificationRowItem,
} from '../types/notification.types';

export interface GroupedNotificationsResult {
  groupedItems: NotificationListItem[];
  stickyHeaderIndices: number[];
  totalNotifications: number;
  totalUnread: number;
}

/**
 * Pure date formatting helper for relative timestamps:
 * - < 1 min: "Just now"
 * - < 60 min: "Xm ago"
 * - < 24 hours: "Xh ago"
 * - 1 day ago: "Yesterday"
 * - < 7 days: "Xd ago"
 * - Older: "MMM d" (e.g. "Aug 19") or "MMM d, yyyy" if different year
 */
export function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    const isCurrentYear = date.getFullYear() === now.getFullYear();
    const options: Intl.DateTimeFormatOptions = isCurrentYear
      ? { month: 'short', day: 'numeric' }
      : { month: 'short', day: 'numeric', year: 'numeric' };

    return date.toLocaleDateString(undefined, options);
  } catch {
    return '';
  }
}

/**
 * Formats a date header string:
 * - "Today"
 * - "Yesterday"
 * - "Month Day, Year" / "Month Day" for older
 */
export function formatGroupHeaderTitle(dateKey: string, sampleDate: Date): string {
  const now = new Date();
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(yesterday.getDate()).padStart(2, '0')}`;

  if (dateKey === todayKey) {
    return 'Today';
  }
  if (dateKey === yesterdayKey) {
    return 'Yesterday';
  }

  const isCurrentYear = sampleDate.getFullYear() === now.getFullYear();
  if (isCurrentYear) {
    return sampleDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  return sampleDate.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Pure function: takes flat NotificationItem[] and returns flat NotificationListItem[]
 * with header items injected at section boundaries, plus recalculates stickyHeaderIndices for FlashList.
 *
 * Guaranteed properties:
 * 1. Stable across pagination (re-runs on the entire flattened cache).
 * 2. Empty groups are completely dropped (if user deletes last item in a group, the header is removed).
 * 3. Exact sticky header indices mapped to the flat array indices.
 */
export function groupNotificationsByDate(
  items: NotificationItem[]
): GroupedNotificationsResult {
  if (!Array.isArray(items) || items.length === 0) {
    return {
      groupedItems: [],
      stickyHeaderIndices: [],
      totalNotifications: 0,
      totalUnread: 0,
    };
  }

  // Group items by local calendar day key (YYYY-MM-DD)
  const groupsMap = new Map<
    string,
    {
      date: Date;
      items: NotificationItem[];
    }
  >();

  let totalUnread = 0;

  for (const item of items) {
    if (!item) continue;
    if (!item.is_read) {
      totalUnread += 1;
    }

    let date: Date;
    try {
      date = new Date(item.created_at);
      if (isNaN(date.getTime())) {
        date = new Date();
      }
    } catch {
      date = new Date();
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;

    const existing = groupsMap.get(dateKey);
    if (existing) {
      existing.items.push(item);
    } else {
      groupsMap.set(dateKey, {
        date,
        items: [item],
      });
    }
  }

  // Sort groups descending by date key
  const sortedDateKeys = Array.from(groupsMap.keys()).sort((a, b) => b.localeCompare(a));

  const groupedItems: NotificationListItem[] = [];
  const stickyHeaderIndices: number[] = [];

  for (const dateKey of sortedDateKeys) {
    const group = groupsMap.get(dateKey);
    if (!group || group.items.length === 0) {
      // Drop empty group
      continue;
    }

    const headerTitle = formatGroupHeaderTitle(dateKey, group.date);
    const headerIndex = groupedItems.length;
    stickyHeaderIndices.push(headerIndex);

    const headerItem: NotificationHeaderItem = {
      type: 'header',
      id: `header_${dateKey}`,
      title: headerTitle,
      dateKey,
      count: group.items.length,
    };
    groupedItems.push(headerItem);

    // Add each notification row item
    for (const notification of group.items) {
      const rowItem: NotificationRowItem = {
        type: 'notification',
        id: notification.id,
        notification,
      };
      groupedItems.push(rowItem);
    }
  }

  return {
    groupedItems,
    stickyHeaderIndices,
    totalNotifications: items.length,
    totalUnread,
  };
}
