# Chat Service API & Customer App Integration Specification

> **Target Audience:** Customer App Engineers, Frontend/Mobile Engineers, Backend Integrators  
> **Service:** `chat-service` (TaskLync Microservices Platform)  
> **API Gateway Base URL (HTTP):** `https://api.yourdomain.com/api/v1/chat`  
> **API Gateway WebSocket URL:** `wss://api.yourdomain.com` (Path: `/chat`)  
> **Authentication:** Standard JWT Bearer Token (`Bearer <ACCESS_TOKEN>`) with `role: "user"`

---

## Executive Summary & Architecture

The **TaskLync Chat Service** provides direct, real-time, booking-scoped communication between Customers and Workers. Every chat room is tied to a specific `booking_id`. 

- **Access Lifecycle:** Rooms are automatically provisioned when a booking is created/accepted and remain `ACTIVE` until the booking is completed or cancelled (`CLOSED`).
- **Communication Protocol:**
  - **REST APIs:** Used for listing rooms, retrieving room metadata, fetching paginated chat history, and uploading multimedia files (images).
  - **WebSocket (Socket.IO):** Used for real-time bi-directional messaging, live typing status, online presence, and instant read receipts.

---

## 1. Authentication & Headers

All REST requests and WebSocket handshakes require a valid JWT issued by the Auth Service containing the customer's identity:
```json
{
  "userId": "usr_98a76bc4-1234-5678-90ab-cdef01234567",
  "role": "user"
}
```

### Standard HTTP Request Headers
| Header | Value | Description |
| :--- | :--- | :--- |
| `Authorization` | `Bearer <JWT_TOKEN>` | **Required**. Customer access token |
| `Content-Type` | `application/json` (or `multipart/form-data` for uploads) | Request payload format |
| `x-request-id` | `UUID v4` (Optional) | Tracing ID for telemetry and logging |

---

## 2. REST API Endpoints

### 2.1. List Customer Chat Rooms
Retrieves all conversation rooms associated with the authenticated customer.

- **Method & Route:** `GET /api/v1/chat/rooms`
- **Authentication:** `Bearer <TOKEN>` (Role: `user`)

#### Query Parameters
*None required.*

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": [
    {
      "booking_id": "bkg_7c8d9e0f-1a2b-3c4d-5e6f-7a8b9c0d1e2f",
      "counterparty_id": "wrk_4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d",
      "counterparty_type": "worker",
      "status": "ACTIVE",
      "last_message_at": "2026-08-14T10:30:00.000Z",
      "last_message_preview": "I have arrived at your location.",
      "last_message_sender_type": "worker",
      "unread": true
    }
  ],
  "meta": {
    "total": 1
  }
}
```

---

### 2.2. Get Room Details
Fetches detailed state and participant IDs for a specific booking chat room.

- **Method & Route:** `GET /api/v1/chat/rooms/:bookingId`
- **Authentication:** `Bearer <TOKEN>` (Role: `user`)

#### Path Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `bookingId` | `string` | **Yes** | The UUID of the booking |

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "id": "room_3b4c5d6e-7f8a-9b0c-1d2e-3f4a5b6c7d8e",
    "booking_id": "bkg_7c8d9e0f-1a2b-3c4d-5e6f-7a8b9c0d1e2f",
    "user_id": "usr_98a76bc4-1234-5678-90ab-cdef01234567",
    "worker_id": "wrk_4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d",
    "status": "ACTIVE",
    "last_message_at": "2026-08-14T10:30:00.000Z",
    "last_message_preview": "I have arrived at your location.",
    "last_message_sender_type": "worker",
    "archived_at": null,
    "closed_at": null,
    "created_at": "2026-08-14T10:00:00.000Z",
    "updated_at": "2026-08-14T10:30:00.000Z"
  }
}
```

---

### 2.3. Get Message History (Cursor-based Pagination)
Retrieves historical messages for initial load or infinite scrolling backwards.

- **Method & Route:** `GET /api/v1/chat/rooms/:bookingId/messages`
- **Authentication:** `Bearer <TOKEN>` (Role: `user`)

#### Path & Query Parameters
| Parameter | Location | Type | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `bookingId` | Path | `string` | — | Booking UUID |
| `cursor` | Query | `string` | `null` | ISO-8601 Timestamp / Cursor token from previous page |
| `limit` | Query | `integer` | `30` | Number of messages to retrieve (1-100) |

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": [
    {
      "id": "msg_01JABCDEF1234567890ABCDEF1",
      "room_id": "room_3b4c5d6e-7f8a-9b0c-1d2e-3f4a5b6c7d8e",
      "booking_id": "bkg_7c8d9e0f-1a2b-3c4d-5e6f-7a8b9c0d1e2f",
      "sender_id": "usr_98a76bc4-1234-5678-90ab-cdef01234567",
      "sender_type": "user",
      "type": "text",
      "content": "Hi, please ring bell #402 when you arrive.",
      "media_url": null,
      "media_thumbnail_url": null,
      "metadata": null,
      "read_by": [
        "usr_98a76bc4-1234-5678-90ab-cdef01234567",
        "wrk_4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d"
      ],
      "created_at": "2026-08-14T10:15:00.000Z"
    },
    {
      "id": "msg_01JABCDEF1234567890ABCDEF2",
      "room_id": "room_3b4c5d6e-7f8a-9b0c-1d2e-3f4a5b6c7d8e",
      "booking_id": "bkg_7c8d9e0f-1a2b-3c4d-5e6f-7a8b9c0d1e2f",
      "sender_id": "wrk_4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d",
      "sender_type": "worker",
      "type": "text",
      "content": "I have arrived at your location.",
      "media_url": null,
      "media_thumbnail_url": null,
      "metadata": null,
      "read_by": [
        "wrk_4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d"
      ],
      "created_at": "2026-08-14T10:30:00.000Z"
    }
  ],
  "meta": {
    "next_cursor": "2026-08-14T10:15:00.000Z",
    "has_more": false
  }
}
```

---

### 2.4. Upload Media (Images)
Uploads an image file to S3/Cloud Storage and returns the public CDN URL and thumbnail.

- **Method & Route:** `POST /api/v1/chat/rooms/:bookingId/messages/media`
- **Authentication:** `Bearer <TOKEN>` (Role: `user`)
- **Content-Type:** `multipart/form-data`

#### Path & Form Parameters
| Parameter | Location | Type | Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| `bookingId` | Path | `string` | **Yes** | Booking UUID |
| `file` | Form-Data | `File (Binary)` | **Yes** | Image file (`.jpg`, `.png`, `.webp`, max 10MB) |

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "media_url": "https://cdn.yourdomain.com/chat/bkg_123/img_full_99812.webp",
    "media_thumbnail_url": "https://cdn.yourdomain.com/chat/bkg_123/img_thumb_99812.webp"
  }
}
```
*Note: After uploading media, the Customer App sends the `send_message` Socket event with `type: "image"` and `mediaUrl: data.media_url`.*

---

### 2.5. Mark Messages as Read
Marks unread messages in the room as read by the customer.

- **Method & Route:** `PATCH /api/v1/chat/rooms/:bookingId/read`
- **Authentication:** `Bearer <TOKEN>` (Role: `user`)

#### Path Parameters
| Parameter | Location | Type | Description |
| :--- | :--- | :--- | :--- |
| `bookingId` | Path | `string` | Booking UUID |

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "marked_read": 3
  }
}
```

---

## 3. Real-Time WebSocket API (Socket.IO)

The real-time layer uses **Socket.IO v4**.

- **Connection URL:** `https://api.yourdomain.com`
- **Socket Path:** `/chat`
- **Transports:** `["websocket", "polling"]`

### 3.1. Client Handshake Authentication
Customers authenticate during handshake by supplying the JWT in the `auth` object or `query` params.

```javascript
import { io } from "socket.io-client";

const socket = io("https://api.yourdomain.com", {
  path: "/chat",
  transports: ["websocket"],
  auth: {
    token: customerJwtToken
  }
});
```

---

### 3.2. Client-to-Server Events (Emit)

#### 1. `join_room`
Joins the WebSocket room channel for a booking. Required before receiving live messages.
```javascript
socket.emit("join_room", {
  bookingId: "bkg_7c8d9e0f-1a2b-3c4d-5e6f-7a8b9c0d1e2f"
});
```

#### 2. `leave_room`
Leaves the room when the customer exits the chat view.
```javascript
socket.emit("leave_room", {
  bookingId: "bkg_7c8d9e0f-1a2b-3c4d-5e6f-7a8b9c0d1e2f"
});
```

#### 3. `send_message`
Sends a message to the worker. Supports `text`, `image`, and `location`.

**Text Message Example:**
```javascript
socket.emit("send_message", {
  bookingId: "bkg_7c8d9e0f-1a2b-3c4d-5e6f-7a8b9c0d1e2f",
  type: "text",
  content: "Can you please bring extra cleaning supplies?"
});
```

**Image Message Example:**
```javascript
socket.emit("send_message", {
  bookingId: "bkg_7c8d9e0f-1a2b-3c4d-5e6f-7a8b9c0d1e2f",
  type: "image",
  content: "Photo of broken lock",
  mediaUrl: "https://cdn.yourdomain.com/chat/bkg_123/img_full_99812.webp"
});
```

**Location / Coordinates Example:**
```javascript
socket.emit("send_message", {
  bookingId: "bkg_7c8d9e0f-1a2b-3c4d-5e6f-7a8b9c0d1e2f",
  type: "location",
  content: "Current parking location",
  metadata: {
    latitude: 37.7749,
    longitude: -122.4194
  }
});
```

#### 4. `typing_start` & `typing_stop`
Emitted as the customer starts or stops typing.
```javascript
// On typing in text field
socket.emit("typing_start", { bookingId: "bkg_7c8d9e0f-1a2b-3c4d-5e6f-7a8b9c0d1e2f" });

// On stop typing / blur
socket.emit("typing_stop", { bookingId: "bkg_7c8d9e0f-1a2b-3c4d-5e6f-7a8b9c0d1e2f" });
```

#### 5. `heartbeat`
Maintains Redis presence TTL when the user has the room active on screen. Send every 30 seconds.
```javascript
socket.emit("heartbeat");
```

---

### 3.3. Server-to-Client Events (Listen)

| Event Name | Payload Structure | Description |
| :--- | :--- | :--- |
| `message_received` | `MessageReceivedEvent` | New incoming or sent message (broadcasted to all room participants). |
| `typing` | `{ bookingId: string, userId: string, senderType: 'user'\|'worker', isTyping: boolean }` | Real-time typing status of the counterparty. |
| `message_read` | `{ bookingId: string, readBy: string, messageIds: string[] }` | Delivery/read receipts when the worker opens messages. |
| `user_joined` | `{ bookingId: string, userId: string }` | Worker joined the active room channel. |
| `user_left` | `{ bookingId: string, userId: string }` | Worker navigated away from the room. |
| `room_closed` | `{ bookingId: string, reason: string }` | Booking finished/cancelled; chat is disabled. |
| `error` | `{ code: string, message: string }` | Access violation, validation error, or auth failure. |

#### Message Received Payload (`message_received`)
```json
{
  "id": "msg_01JABCDEF1234567890ABCDEF2",
  "bookingId": "bkg_7c8d9e0f-1a2b-3c4d-5e6f-7a8b9c0d1e2f",
  "senderId": "wrk_4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d",
  "senderType": "worker",
  "type": "text",
  "content": "I have arrived at your location.",
  "mediaUrl": null,
  "mediaThumbnailUrl": null,
  "metadata": null,
  "createdAt": "2026-08-14T10:30:00.000Z"
}
```

---

## 4. Customer App Complete Integration Code (React Native / TypeScript)

Here is a production-grade chat manager hook for the Customer mobile application:

```typescript
import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const API_BASE_URL = 'https://api.yourdomain.com';
const CHAT_REST_URL = `${API_BASE_URL}/api/v1/chat`;

export interface ChatMessage {
  id: string;
  bookingId: string;
  senderId: string;
  senderType: 'user' | 'worker' | 'system';
  type: 'text' | 'image' | 'location' | 'system';
  content: string | null;
  mediaUrl?: string | null;
  createdAt: string;
}

export function useCustomerChat(bookingId: string, token: string, customerId: string) {
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isWorkerTyping, setIsWorkerTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRoomClosed, setIsRoomClosed] = useState(false);

  // 1. Fetch initial message history
  const loadMessageHistory = useCallback(async () => {
    try {
      const response = await fetch(`${CHAT_REST_URL}/rooms/${bookingId}/messages?limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await response.json();
      if (json.success) {
        // Map backend snake_case message to interface
        const history: ChatMessage[] = json.data.map((m: any) => ({
          id: m.id,
          bookingId: m.booking_id,
          senderId: m.sender_id,
          senderType: m.sender_type,
          type: m.type,
          content: m.content,
          mediaUrl: m.media_url,
          createdAt: m.created_at,
        }));
        setMessages(history);
      }
    } catch (err) {
      console.error('Failed to load chat history', err);
    } finally {
      setIsLoading(false);
    }
  }, [bookingId, token]);

  // 2. Mark messages as read
  const markMessagesRead = useCallback(async () => {
    try {
      await fetch(`${CHAT_REST_URL}/rooms/${bookingId}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  }, [bookingId, token]);

  // 3. Socket.IO Connection & Listeners
  useEffect(() => {
    loadMessageHistory();
    markMessagesRead();

    const socket = io(API_BASE_URL, {
      path: '/chat',
      transports: ['websocket'],
      auth: { token },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_room', { bookingId });
    });

    socket.on('message_received', (msg: ChatMessage) => {
      if (msg.bookingId === bookingId) {
        setMessages((prev) => [...prev, msg]);
        if (msg.senderType === 'worker') {
          markMessagesRead();
        }
      }
    });

    socket.on('typing', (data: { bookingId: string; senderType: string; isTyping: boolean }) => {
      if (data.bookingId === bookingId && data.senderType === 'worker') {
        setIsWorkerTyping(data.isTyping);
      }
    });

    socket.on('room_closed', () => {
      setIsRoomClosed(true);
    });

    // Heartbeat every 30s
    const heartbeatTimer = setInterval(() => {
      socket.emit('heartbeat');
    }, 30000);

    return () => {
      clearInterval(heartbeatTimer);
      socket.emit('leave_room', { bookingId });
      socket.disconnect();
    };
  }, [bookingId, token, loadMessageHistory, markMessagesRead]);

  // 4. Send Text Message
  const sendTextMessage = (content: string) => {
    if (!socketRef.current || !content.trim()) return;
    socketRef.current.emit('send_message', {
      bookingId,
      type: 'text',
      content,
    });
  };

  // 5. Send Image Message (Upload + Socket emit)
  const sendImageMessage = async (imageUri: string, mimeType = 'image/jpeg') => {
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: mimeType,
      name: 'upload.jpg',
    } as any);

    const res = await fetch(`${CHAT_REST_URL}/rooms/${bookingId}/messages/media`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const json = await res.json();
    if (json.success && socketRef.current) {
      socketRef.current.emit('send_message', {
        bookingId,
        type: 'image',
        content: 'Image attachment',
        mediaUrl: json.data.media_url,
      });
    }
  };

  // 6. Typing Handlers
  const handleTypingStart = () => socketRef.current?.emit('typing_start', { bookingId });
  const handleTypingStop = () => socketRef.current?.emit('typing_stop', { bookingId });

  return {
    messages,
    isLoading,
    isWorkerTyping,
    isRoomClosed,
    sendTextMessage,
    sendImageMessage,
    handleTypingStart,
    handleTypingStop,
  };
}
```

---

## 5. Error Code Reference

| Error Code | HTTP Status | WebSocket Event | Explanation / Resolution |
| :--- | :--- | :--- | :--- |
| `UNAUTHORIZED` | `401` | `connect_error` | Missing or expired JWT token. Refresh token and reconnect. |
| `FORBIDDEN` | `403` | `ROOM_ACCESS_DENIED` | Customer is not a participant in this booking. |
| `ROOM_NOT_FOUND` | `404` | `ROOM_NOT_FOUND` | No chat room exists for the provided `bookingId`. |
| `ROOM_CLOSED` | `400` | `ROOM_CLOSED` | Booking has ended; new messages cannot be sent. |
| `VALIDATION_ERROR`| `400` | `VALIDATION_ERROR` | Empty message content or invalid payload parameters. |
| `FILE_TOO_LARGE` | `413` | — | Uploaded media exceeds maximum file limit (10 MB). |
| `RATE_LIMITED` | `429` | `RATE_LIMITED` | Message frequency exceeded safety thresholds. |
