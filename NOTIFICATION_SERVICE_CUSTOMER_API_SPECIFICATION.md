# Notification Service API & Customer App Integration Specification

> **Target Audience:** Customer Mobile & Web Engineers, Frontend/Integrations Engineers, QA, Backend Platform Team  
> **Service:** `notification-service` (TaskLync Microservices Platform)  
> **API Gateway Base URL (HTTP):** `https://api.yourdomain.com/api/v1/notifications`  
> **Internal Service Port:** `3009`  
> **Authentication:** Standard JWT Bearer Token (`Authorization: Bearer <ACCESS_TOKEN>`) with `role: "user"` or `role: "worker"`  

---

## Table of Contents

1. [Executive Summary & Delivery Architecture](#1-executive-summary--delivery-architecture)
2. [Authentication & Request Headers](#2-authentication--request-headers)
3. [Customer REST API Endpoints & Parameters](#3-customer-rest-api-endpoints--parameters)
   - [3.1 GET /api/v1/notifications (List Feed & Unread Count)](#31-get-apiv1notifications-list-feed--unread-count)
   - [3.2 PATCH /api/v1/notifications/:id/read (Mark Single Notification Read)](#32-patch-apiv1notificationsidread-mark-single-notification-read)
   - [3.3 PATCH /api/v1/notifications/read-all (Mark All Notifications Read)](#33-patch-apiv1notificationsread-all-mark-all-notifications-read)
   - [3.4 GET /api/v1/notifications/preferences (Get Category Preferences)](#34-get-apiv1notificationspreferences-get-category-preferences)
   - [3.5 PUT /api/v1/notifications/preferences (Update Category Preference)](#35-put-apiv1notificationspreferences-update-category-preference)
4. [Internal System & Admin Endpoints](#4-internal-system--admin-endpoints)
   - [4.1 POST /internal/notifications/broadcasts (Launch Broadcast Campaign)](#41-post-internalnotificationsbroadcasts-launch-broadcast-campaign)
   - [4.2 GET /internal/notifications/broadcasts/:id (Get Campaign Status)](#42-get-internalnotificationsbroadcastsid-get-campaign-status)
5. [End-to-End Customer App Integration Guide](#5-end-to-end-customer-app-integration-guide)
   - [Step 1: Firebase Cloud Messaging (FCM) Setup & Token Sync](#step-1-firebase-cloud-messaging-fcm-setup--token-sync)
   - [Step 2: Deep Link Routing & Payload Handling](#step-2-deep-link-routing--payload-handling)
   - [Step 3: In-App Notification Bell & Badge Count Management](#step-3-in-app-notification-bell--badge-count-management)
   - [Step 4: Notification Feed Screen (Cursor Pagination & Infinite Scroll)](#step-4-notification-feed-screen-cursor-pagination--infinite-scroll)
   - [Step 5: Notification Preferences Screen (Channel & Category Toggles)](#step-5-notification-preferences-screen-channel--category-toggles)
6. [Supported Notification Categories & Deep Links Reference](#6-supported-notification-categories--deep-links-reference)
7. [Error Handling & Status Codes Standard](#7-error-handling--status-codes-standard)

---

## 1. Executive Summary & Delivery Architecture

The **Notification Service** acts as TaskLync's single fan-out gateway for all customer communications across 4 channels:
1. **In-App Notification Feed (Bell Icon):** Persistent, queryable notifications stored in PostgreSQL (retained for 90 days).
2. **Push Notifications (FCM):** Delivered to iOS and Android devices with actionable deep-link payloads.
3. **SMS (Twilio):** Reserved for urgent transactional events (e.g., booking updates, safety alerts).
4. **Email (Brevo / SendGrid SMTP):** Transaction receipts and critical audit logs.

### 3-Layer Delivery & Suppression Gate

Before any notification is dispatched to a customer device, it must pass through a strict **3-Layer Gate**:
1. **Layer 1: Global Master Kill Switch** (`users.push_enabled`, `users.email_enabled`): Checked at the user profile level.
2. **Layer 2: Category Preference** (`notification_preferences`): The customer's custom preference for each category (`booking`, `payment`, `chat`, `review`, `worker`, `platform`, `marketing`).
3. **Layer 3: Reachability & Contact Data**: Target must have an active `fcm_token`, verified phone number, or valid email.

```
Incoming Event (Kafka / Broadcast)
               │
               ▼
┌───────────────────────────────────────┐
│ Always write to `notifications` table │  ---> In-App Feed (Bell Icon)
└──────────────────┬────────────────────┘
                   │
                   ▼
┌───────────────────────────────────────┐
│  Layer 1: Global Master Switch        │  ---> (users.push_enabled / email_enabled)
└──────────────────┬────────────────────┘
                   │
                   ▼
┌───────────────────────────────────────┐
│  Layer 2: Category Preferences        │  ---> (notification_preferences table)
└──────────────────┬────────────────────┘
                   │
                   ▼
┌───────────────────────────────────────┐
│  Layer 3: Device Token / Contact Info │  ---> (FCM token / phone / email present)
└──────────────────┬────────────────────┘
                   │
                   ▼
       Queue BullMQ Job & Dispatch (FCM / Twilio / Brevo)
```

---

## 2. Authentication & Request Headers

All customer-facing endpoints are protected by the API Gateway and require a valid RS256 JWT in the `Authorization` header.

### Standard Request Headers

| Header | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `Authorization` | `String` | **Yes** | Standard JWT Bearer token | `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `Content-Type` | `String` | **Yes** (for PUT/POST/PATCH) | Request content type | `application/json` |
| `x-request-id` | `UUID v4` | No | Client-generated request correlation ID for tracing | `9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d` |

### Decoded JWT Token Payload Example
```json
{
  "id": "c7a6e118-2921-4f32-9df7-28fb7b2a95c1",
  "role": "user",
  "email": "customer@example.com",
  "iat": 1787115528,
  "exp": 1787201928
}
```

---

## 3. Customer REST API Endpoints & Parameters

### 3.1 GET `/api/v1/notifications` (List Feed & Unread Count)

Retrieves the authenticated customer's notification feed in descending order (`created_at DESC`) using cursor-based keyset pagination.

- **Route:** `GET /api/v1/notifications`
- **Auth:** `Bearer <TOKEN>` (Role: `user` or `worker`)

#### Query Parameters

| Parameter | Type | Required | Default | Validation / Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `cursor` | `UUID` | No | `null` | Must be a valid UUIDv4 of the last item received | Keyset cursor for infinite scroll. If omitted, returns Page 1 with `unread_count`. |
| `limit` | `Integer` | No | `20` | `min: 1`, `max: 30` | Number of notifications per page. |
| `unread_only` | `Boolean` | No | `false` | `true` \| `false` | When `true`, filters only unread notifications (`is_read = false`). |

#### Request Example
```http
GET /api/v1/notifications?limit=10&unread_only=false HTTP/1.1
Host: api.yourdomain.com
Authorization: Bearer <ACCESS_TOKEN>
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": [
    {
      "id": "e4b2d184-7a19-4f51-b841-a6771d9dcb8e",
      "category": "booking",
      "template_key": "booking_accepted",
      "title": "Booking Accepted!",
      "body": "Ahmed Khan accepted your booking and will arrive at 10:30 AM.",
      "deep_link": "tasklync://booking/bkg_98234123-1122-3344-5566-778899aabbcc",
      "is_read": false,
      "created_at": "2026-08-19T04:30:00.000Z",
      "campaign_id": null
    },
    {
      "id": "11d5f2a9-0b44-4f01-9233-0c1122334455",
      "category": "payment",
      "template_key": "payment_received",
      "title": "Payment Confirmed",
      "body": "Your payment of PKR 3,500 has been held securely in escrow.",
      "deep_link": "tasklync://booking/bkg_98234123-1122-3344-5566-778899aabbcc",
      "is_read": true,
      "created_at": "2026-08-19T04:15:00.000Z",
      "campaign_id": null
    }
  ],
  "meta": {
    "next_cursor": "11d5f2a9-0b44-4f01-9233-0c1122334455",
    "has_more": true,
    "unread_count": 1
  }
}
```

> [!NOTE]
> `meta.unread_count` is calculated and returned on **Page 1 only** (when `cursor` is omitted) to optimize database index scans. Subsequent pages return `next_cursor` and `has_more`.

---

### 3.2 PATCH `/api/v1/notifications/:id/read` (Mark Single Notification Read)

Marks a single notification as read for the authenticated customer.

- **Route:** `PATCH /api/v1/notifications/:id/read`
- **Auth:** `Bearer <TOKEN>` (Role: `user` or `worker`)

#### Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | **Yes** | The UUID of the notification to mark as read |

#### Request Example
```http
PATCH /api/v1/notifications/e4b2d184-7a19-4f51-b841-a6771d9dcb8e/read HTTP/1.1
Host: api.yourdomain.com
Authorization: Bearer <ACCESS_TOKEN>
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "id": "e4b2d184-7a19-4f51-b841-a6771d9dcb8e",
    "is_read": true,
    "read_at": "2026-08-19T04:45:12.304Z"
  }
}
```

#### Error Response (`404 Not Found`)
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Notification not found"
  }
}
```

---

### 3.3 PATCH `/api/v1/notifications/read-all` (Mark All Notifications Read)

Marks all unread notifications for the authenticated customer as read in a single transactional batch.

- **Route:** `PATCH /api/v1/notifications/read-all`
- **Auth:** `Bearer <TOKEN>` (Role: `user` or `worker`)

#### Request Example
```http
PATCH /api/v1/notifications/read-all HTTP/1.1
Host: api.yourdomain.com
Authorization: Bearer <ACCESS_TOKEN>
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "marked_read": 5
  }
}
```

---

### 3.4 GET `/api/v1/notifications/preferences` (Get Category Preferences)

Fetches the complete matrix of channel toggles (`push`, `sms`, `email`) for all 7 notification categories. If a user has not customized a category, the system's safe default values are automatically computed and returned.

- **Route:** `GET /api/v1/notifications/preferences`
- **Auth:** `Bearer <TOKEN>` (Role: `user` or `worker`)

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": [
    {
      "category": "booking",
      "push_enabled": true,
      "sms_enabled": true,
      "email_enabled": false
    },
    {
      "category": "payment",
      "push_enabled": true,
      "sms_enabled": true,
      "email_enabled": true
    },
    {
      "category": "chat",
      "push_enabled": true,
      "sms_enabled": false,
      "email_enabled": false
    },
    {
      "category": "review",
      "push_enabled": true,
      "sms_enabled": false,
      "email_enabled": false
    },
    {
      "category": "worker",
      "push_enabled": true,
      "sms_enabled": false,
      "email_enabled": false
    },
    {
      "category": "platform",
      "push_enabled": true,
      "sms_enabled": false,
      "email_enabled": false
    },
    {
      "category": "marketing",
      "push_enabled": false,
      "sms_enabled": false,
      "email_enabled": false
    }
  ]
}
```

---

### 3.5 PUT `/api/v1/notifications/preferences` (Update Category Preference)

Updates or creates (upserts) the channel preferences for a specific category.

- **Route:** `PUT /api/v1/notifications/preferences`
- **Auth:** `Bearer <TOKEN>` (Role: `user` or `worker`)

#### Request Body Parameters

| Field | Type | Required | Values / Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `category` | `String` | **Yes** | `booking` \| `payment` \| `chat` \| `review` \| `worker` \| `platform` \| `marketing` | Target notification category |
| `push_enabled` | `Boolean` | **Yes** | `true` \| `false` | Enable/disable push notifications for this category |
| `sms_enabled` | `Boolean` | **Yes** | `true` \| `false` | Enable/disable SMS for this category |
| `email_enabled` | `Boolean` | **Yes** | `true` \| `false` | Enable/disable Email for this category |

#### Request Example
```http
PUT /api/v1/notifications/preferences HTTP/1.1
Host: api.yourdomain.com
Content-Type: application/json
Authorization: Bearer <ACCESS_TOKEN>

{
  "category": "marketing",
  "push_enabled": true,
  "sms_enabled": false,
  "email_enabled": true
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "category": "marketing",
    "push_enabled": true,
    "sms_enabled": false,
    "email_enabled": true
  }
}
```

---

## 4. Internal System & Admin Endpoints

> [!IMPORTANT]
> `/internal/*` routes are protected strictly at the private VPC network level. They are never exposed publicly through the API Gateway.

### 4.1 POST `/internal/notifications/broadcasts` (Launch Broadcast Campaign)

Dispatches an asynchronous marketing or platform announcement across a targeted user/worker audience segment.

- **Route:** `POST /internal/notifications/broadcasts`

#### Request Body Parameters

| Field | Type | Required | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `title` | `String` | **Yes** | `1 - 200 chars` | Internal campaign title |
| `template_key` | `String` | **Yes** | Registered template ID | Must match compiled template (e.g. `independence_day_greeting`) |
| `template_data` | `Object` | No | JSON object (default: `{}`) | Dynamic handlebars/template variables |
| `channels` | `Array<String>` | **Yes** | `['push']`, `['push', 'email']`, etc. | Target delivery channels |
| `category` | `String` | **Yes** | `platform` \| `marketing` | Restricted to non-operational categories |
| `segment_type` | `String` | **Yes** | `all_users` \| `all_workers` \| `category_city` \| `custom_ids` | Target audience segment |
| `segment_filter` | `Object` | **Yes** | Dependent on `segment_type` | Filter criteria (e.g. `{"city": "Lahore", "category_id": "electrician"}`) |
| `created_by` | `UUID` | **Yes** | Valid Admin UUID | Admin operator ID who authorized the broadcast |

#### Response (`202 Accepted`)
```json
{
  "success": true,
  "data": {
    "campaign_id": "9b6421c4-1188-4903-8fa9-9941a3cd4301",
    "status": "SENDING"
  }
}
```

---

### 4.2 GET `/internal/notifications/broadcasts/:id` (Get Campaign Status)

- **Route:** `GET /internal/notifications/broadcasts/:id`

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "id": "9b6421c4-1188-4903-8fa9-9941a3cd4301",
    "title": "Ramadan Mubarak Promo",
    "status": "COMPLETED",
    "total_recipients": 12500,
    "sent_count": 12100,
    "failed_count": 400,
    "created_at": "2026-08-19T02:00:00.000Z",
    "updated_at": "2026-08-19T02:04:12.000Z"
  }
}
```

---

## 5. End-to-End Customer App Integration Guide

Follow this 5-step integration guide in your iOS/Android/React Native/Flutter customer application.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       CUSTOMER APP INTEGRATION LIFECYCLE                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. App Startup:                                                             │
│    ├── Request Notification Permissions                                     │
│    ├── Obtain FCM Token from Firebase SDK                                   │
│    └── Register/Sync FCM Token with Backend (user-service profile)          │
│                                                                             │
│ 2. Background / Terminated Push:                                            │
│    ├── Native OS shows Notification (title + body)                          │
│    └── User Taps Push → Extract `deep_link` → Navigate to Target Screen     │
│                                                                             │
│ 3. Foreground Push:                                                         │
│    ├── Display In-App Toast / Banner                                        │
│    └── Increment Local Unread Badge Counter                                 │
│                                                                             │
│ 4. In-App Bell Screen:                                                      │
│    ├── Call `GET /api/v1/notifications` → Render List                       │
│    ├── Infinite Scroll Keyset Pagination via `meta.next_cursor`             │
│    └── Tap Item → Call `PATCH /api/v1/notifications/:id/read` & Route       │
│                                                                             │
│ 5. Settings Screen:                                                         │
│    ├── Fetch `GET /api/v1/notifications/preferences`                        │
│    └── Toggle Category Switch → Optimistic `PUT /preferences`               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Step 1: Firebase Cloud Messaging (FCM) Setup & Token Sync

When the user logs in or launches the app, retrieve the device registration token from Firebase and register it with the backend via the user profile endpoint.

#### Flutter Example:
```dart
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class NotificationSyncService {
  final FirebaseMessaging _fcm = FirebaseMessaging.instance;

  Future<void> initNotifications(String accessToken) async {
    // 1. Request Permission
    NotificationSettings settings = await _fcm.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      // 2. Fetch Device Token
      String? token = await _fcm.getToken();
      if (token != null) {
        await _syncTokenWithBackend(token, accessToken);
      }

      // 3. Listen for Token Rotations
      _fcm.onTokenRefresh.listen((newToken) {
        _syncTokenWithBackend(newToken, accessToken);
      });
    }
  }

  Future<void> _syncTokenWithBackend(String token, String accessToken) async {
    final response = await http.patch(
      Uri.parse('https://api.yourdomain.com/api/v1/users/profile'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $accessToken',
      },
      body: jsonEncode({
        'fcm_token': token,
        'push_enabled': true,
      }),
    );

    if (response.statusCode != 200) {
      print('FCM Token sync failed: ${response.body}');
    }
  }
}
```

#### React Native / TypeScript Example:
```typescript
import messaging from '@react-native-firebase/messaging';
import axios from 'axios';

export async function registerFcmToken(accessToken: string): Promise<void> {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (!enabled) return;

  const fcmToken = await messaging().getToken();

  if (fcmToken) {
    await axios.patch(
      'https://api.yourdomain.com/api/v1/users/profile',
      { fcm_token: fcmToken, push_enabled: true },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
  }

  // Listen for refreshed token
  messaging().onTokenRefresh(async (newToken) => {
    await axios.patch(
      'https://api.yourdomain.com/api/v1/users/profile',
      { fcm_token: newToken },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
  });
}
```

---

### Step 2: Deep Link Routing & Payload Handling

Push notifications sent by TaskLync always include standard FCM `notification` fields (`title`, `body`) and custom `data` containing `deep_link`.

#### FCM Push Payload Structure
```json
{
  "token": "eX_ample_FCM_Token_...",
  "notification": {
    "title": "Booking Accepted!",
    "body": "Ahmed Khan accepted your booking and will arrive at 10:30 AM."
  },
  "data": {
    "deep_link": "tasklync://booking/bkg_98234123-1122-3344-5566-778899aabbcc"
  }
}
```

#### Universal Deep Link Dispatcher (React Native / Navigation)
```typescript
import { Linking } from 'react-native';
import messaging, { RemoteMessage } from '@react-native-firebase/messaging';
import { navigationRef } from './RootNavigation';

export function handleNotificationDeepLink(message: RemoteMessage | null) {
  if (!message?.data?.deep_link) return;

  const url = message.data.deep_link as string;
  routeDeepLink(url);
}

export function routeDeepLink(url: string) {
  if (!url.startsWith('tasklync://')) return;

  const path = url.replace('tasklync://', '');
  const [route, id] = path.split('/');

  switch (route) {
    case 'booking':
      navigationRef.navigate('BookingDetailsScreen', { bookingId: id });
      break;
    case 'chat':
      navigationRef.navigate('ChatRoomScreen', { conversationId: id });
      break;
    case 'review':
      navigationRef.navigate('ReviewScreen', { bookingId: id });
      break;
    case 'notifications':
      navigationRef.navigate('NotificationFeedScreen');
      break;
    default:
      console.warn('Unhandled deep link route:', route);
  }
}
```

---

### Step 3: In-App Notification Bell & Badge Count Management

The App Header Bell icon displays an unread count badge. 

1. On app boot / home screen load, call `GET /api/v1/notifications?limit=1` without `cursor`.
2. Extract `meta.unread_count` and store it in global state (e.g., Redux / Zustand / MobX).
3. Increment when a foreground push message arrives.
4. Decrement when a notification is marked as read, or reset to 0 on `PATCH /read-all`.

```typescript
// Store unread count in Zustand / Redux
import create from 'zustand';

interface NotificationState {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  decrementUnread: () => void;
  clearUnread: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
  decrementUnread: () => set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),
  clearUnread: () => set({ unreadCount: 0 }),
}));
```

---

### Step 4: Notification Feed Screen (Cursor Pagination & Infinite Scroll)

When rendering the list of notifications:
- Initial call: `GET /api/v1/notifications?limit=20`
- Subsequent scroll calls: `GET /api/v1/notifications?limit=20&cursor=<last_item_id>`
- Mark as read on tap: Fire `PATCH /api/v1/notifications/:id/read` optimistically.

```typescript
import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, TouchableOpacity, RefreshControl } from 'react-native';
import axios from 'axios';
import { routeDeepLink } from './deepLinkRouter';
import { useNotificationStore } from './notificationStore';

interface NotificationItem {
  id: string;
  category: string;
  template_key: string;
  title: string;
  body: string;
  deep_link: string | null;
  is_read: boolean;
  created_at: string;
}

export const NotificationFeedScreen = ({ token }: { token: string }) => {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const { setUnreadCount, decrementUnread } = useNotificationStore();

  const fetchFeed = async (cursor: string | null = null, isRefresh = false) => {
    if (loading) return;
    setLoading(true);

    try {
      const url = cursor
        ? `https://api.yourdomain.com/api/v1/notifications?limit=20&cursor=${cursor}`
        : `https://api.yourdomain.com/api/v1/notifications?limit=20`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { data, meta } = res.data;

      if (isRefresh || !cursor) {
        setItems(data);
        if (meta.unread_count !== undefined) {
          setUnreadCount(meta.unread_count);
        }
      } else {
        setItems((prev) => [...prev, ...data]);
      }

      setNextCursor(meta.next_cursor);
      setHasMore(meta.has_more);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const handleNotificationPress = async (item: NotificationItem) => {
    if (!item.is_read) {
      // Optimistic UI update
      setItems((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n))
      );
      decrementUnread();

      // Backend sync
      axios.patch(
        `https://api.yourdomain.com/api/v1/notifications/${item.id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }

    if (item.deep_link) {
      routeDeepLink(item.deep_link);
    }
  };

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchFeed(null, true);
          }}
        />
      }
      onEndReached={() => {
        if (hasMore && nextCursor && !loading) {
          fetchFeed(nextCursor);
        }
      }}
      onEndReachedThreshold={0.4}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => handleNotificationPress(item)}
          style={{
            padding: 16,
            backgroundColor: item.is_read ? '#FFFFFF' : '#F0F7FF',
            borderBottomWidth: 1,
            borderColor: '#E5E7EB',
          }}
        >
          <Text style={{ fontWeight: item.is_read ? 'normal' : 'bold' }}>
            {item.title}
          </Text>
          <Text style={{ color: '#4B5563', marginTop: 4 }}>{item.body}</Text>
          <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 6 }}>
            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
};
```

---

### Step 5: Notification Preferences Screen (Channel & Category Toggles)

Build a clean settings interface where customers can enable/disable push, SMS, and email alerts per category.

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, Switch, FlatList, ActivityIndicator } from 'react-native';
import axios from 'axios';

interface CategoryPreference {
  category: string;
  push_enabled: boolean;
  sms_enabled: boolean;
  email_enabled: boolean;
}

export const NotificationPreferencesScreen = ({ token }: { token: string }) => {
  const [preferences, setPreferences] = useState<CategoryPreference[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    axios
      .get('https://api.yourdomain.com/api/v1/notifications/preferences', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setPreferences(res.data.data);
        setLoading(false);
      });
  }, []);

  const togglePreference = async (
    category: string,
    channel: 'push_enabled' | 'sms_enabled' | 'email_enabled',
    value: boolean
  ) => {
    // 1. Optimistic UI update
    setPreferences((prev) =>
      prev.map((pref) =>
        pref.category === category ? { ...pref, [channel]: value } : pref
      )
    );

    const target = preferences.find((p) => p.category === category);
    if (!target) return;

    // 2. Persist update
    try {
      await axios.put(
        'https://api.yourdomain.com/api/v1/notifications/preferences',
        {
          category,
          push_enabled: channel === 'push_enabled' ? value : target.push_enabled,
          sms_enabled: channel === 'sms_enabled' ? value : target.sms_enabled,
          email_enabled: channel === 'email_enabled' ? value : target.email_enabled,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Failed to save preference', err);
      // Revert optimistic update on error
      setPreferences((prev) =>
        prev.map((pref) =>
          pref.category === category ? { ...pref, [channel]: !value } : pref
        )
      );
    }
  };

  if (loading) return <ActivityIndicator size="large" />;

  return (
    <FlatList
      data={preferences}
      keyExtractor={(item) => item.category}
      renderItem={({ item }) => (
        <View style={{ padding: 16, borderBottomWidth: 1, borderColor: '#E5E7EB' }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', textTransform: 'capitalize' }}>
            {item.category} Alerts
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
            <Text>Push Notification</Text>
            <Switch
              value={item.push_enabled}
              onValueChange={(val) => togglePreference(item.category, 'push_enabled', val)}
            />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
            <Text>SMS Alerts</Text>
            <Switch
              value={item.sms_enabled}
              onValueChange={(val) => togglePreference(item.category, 'sms_enabled', val)}
            />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
            <Text>Email Summaries</Text>
            <Switch
              value={item.email_enabled}
              onValueChange={(val) => togglePreference(item.category, 'email_enabled', val)}
            />
          </View>
        </View>
      )}
    />
  );
};
```

---

## 6. Supported Notification Categories & Deep Links Reference

| Category | Typical Event Triggers | Template Keys | Channels | Deep Link Format |
| :--- | :--- | :--- | :--- | :--- |
| `booking` | Booking accepted, started, completed, rejected, cancelled | `booking_accepted`<br>`booking_started`<br>`booking_rejected`<br>`booking_cancelled_by_worker`<br>`booking_completion_requested` | Push, SMS | `tasklync://booking/{bookingId}` |
| `payment` | Payment authorized, held in escrow, released, refunded | `payment_received`<br>`payment_released`<br>`payout_completed` | Push, SMS, Email | `tasklync://booking/{bookingId}` |
| `chat` | New instant message received | `new_chat_message` | Push | `tasklync://chat/{conversationId}` |
| `review` | Customer review posted / review reported | `new_review_received`<br>`review_reported_alert` | Push, Email | `tasklync://booking/{bookingId}` |
| `worker` | Profile verified, badge updated | `worker_verified` | Push | `tasklync://profile` |
| `platform` | Security alerts, system maintenance, terms updates | `dispute_opened_against_you` | Push, SMS, Email | `tasklync://dispute/{disputeId}` |
| `marketing` | Promotional discounts, seasonal greetings, city alerts | `independence_day_greeting`<br>`category_trending_nudge` | Push, Email | `tasklync://promo/{promoCode}` |

---

## 7. Error Handling & Status Codes Standard

All API errors return standard RFC-7807 compliant error payloads.

### Standard Error Response Shape
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable explanation of the failure",
    "details": {}
  }
}
```

### Error Code Reference

| HTTP Status | Error Code | Meaning | Client Action |
| :--- | :--- | :--- | :--- |
| `400` | `VALIDATION_ERROR` | Malformed request body, invalid UUID, or unknown category | Check parameter types and enum values |
| `401` | `UNAUTHORIZED` | Expired, missing, or malformed JWT token | Refresh token with Auth Service or force re-login |
| `403` | `FORBIDDEN` | Role mismatch (e.g. role is not `user` or `worker`) | Ensure token belongs to authenticated customer |
| `404` | `NOT_FOUND` | Notification with given ID does not exist for this user | Remove item from local cache or refresh feed |
| `429` | `RATE_LIMIT_EXCEEDED` | Exceeded API rate limits | Exponential backoff (retry after `Retry-After` header) |
| `500` | `INTERNAL_SERVER_ERROR` | Database or downstream service failure | Display generic error banner and allow manual pull-to-refresh |
