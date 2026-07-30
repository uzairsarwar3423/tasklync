# 📱 TaskLync Customer App - API Specification & Client Integration Architecture

> **Author:** Principal Backend Engineer  
> **Target Audience:** Mobile Engineers (Flutter / React Native / Native iOS & Android), Frontend Web Integrators, QA Engineers  
> **System Architecture:** Distributed Event-Driven Microservices behind API Gateway  
> **Specification Version:** 2.0.0  

---

## 📋 Table of Contents
1. [System Architecture & Core Protocols](#1-system-architecture--core-protocols)
2. [Global Standards, Authentication & Headers](#2-global-standards-authentication--headers)
3. [Module 1: Authentication & Session Lifecycle (`/api/v1/auth`)](#3-module-1-authentication--session-lifecycle-apiv1auth)
4. [Module 2: Customer Profile & User Management (`/api/v1/users`)](#4-module-2-customer-profile--user-management-apiv1users)
5. [Module 3: Saved Addresses & Delivery Locations (`/api/v1/users/me/addresses`)](#5-module-3-saved-addresses--delivery-locations-apiv1usersmeaddresses)
6. [Module 4: Service Catalog & Master Reference Data (`/api/v1/categories`, `/api/v1/services`, `/api/v1/skills`)](#6-module-4-service-catalog--master-reference-data-apiv1categories-apiv1services-apiv1skills)
7. [Module 5: Worker Search Engine & Discovery (`/api/v1/search`)](#7-module-5-worker-search-engine--discovery-apiv1search)
8. [Module 6: Worker Profiles & Public Information (`/api/v1/workers`)](#8-module-6-worker-profiles--public-information-apiv1workers)
9. [Module 7: Booking Lifecycle Engine (`/api/v1/bookings`)](#9-module-7-booking-lifecycle-engine-apiv1bookings)
10. [Module 8: Dispute Management (`/api/v1/bookings/:id/dispute`)](#10-module-8-dispute-management-apiv1bookingsiddispute)
11. [Module 9: Payment Gateway & Saved Payment Methods (`/api/v1/payments`)](#11-module-9-payment-gateway--saved-payment-methods-apiv1payments)
12. [Module 10: Reviews & Rating System (`/api/v1/reviews`)](#12-module-10-reviews--rating-system-apiv1reviews)
13. [Module 11: Real-Time Chat & Socket.IO Gateway (`/api/v1/chat`)](#13-module-11-real-time-chat--socketio-gateway-apiv1chat)
14. [Module 12: In-App Notifications & FCM Integration (`/api/v1/notifications`)](#14-module-12-in-app-notifications--fcm-integration-apiv1notifications)
15. [Customer App Production Connection Guide & Code Snippets](#15-customer-app-production-connection-guide--code-snippets)

---

## 1. System Architecture & Core Protocols

TaskLync backend operates as an enterprise-grade distributed microservices architecture unified behind a central **API Gateway**. The Customer Mobile and Web Applications interact with the platform through two core channels:

1. **REST APIs (HTTP/HTTPS)**: Used for user profile management, service catalog exploration, worker discovery, booking requests, payments, reviews, and address management.
2. **WebSockets (Socket.IO over WSS)**: Used for real-time chat messaging, presence tracking, live worker location updates during active bookings, and instant booking status change push events.

```
                                  ┌────────────────────────┐
                                  │  Customer Mobile App   │
                                  └──────────┬─────────────┘
                                             │
                                             │ HTTPS / Socket.IO
                                             ▼
                                  ┌────────────────────────┐
                                  │  TaskLync API Gateway  │
                                  │    (Port: 3000/443)    │
                                  └──────────┬─────────────┘
                                             │
      ┌──────────────┬──────────────┬────────┼──────────────┬──────────────┬──────────────┐
      ▼              ▼              ▼        ▼              ▼              ▼              ▼
┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐
│Auth       │  │User       │  │Worker     │  │Booking    │  │Payment    │  │Chat       │  │Review     │
│Service    │  │Service    │  │Service    │  │Service    │  │Service    │  │Service    │  │Service    │
└───────────┘  └───────────┘  └───────────┘  └───────────┘  └───────────┘  └───────────┘  └───────────┘
```

### Environment Base URLs

| Environment | REST API Base URL | WebSocket (Socket.IO) URL |
| :--- | :--- | :--- |
| **Local Development** | `http://localhost:3000/api/v1` | `ws://localhost:3000` |
| **Staging / QA** | `https://staging-api.tasklync.pk/api/v1` | `wss://staging-api.tasklync.pk` |
| **Production** | `https://api.tasklync.pk/api/v1` | `wss://api.tasklync.pk` |

---

## 2. Global Standards, Authentication & Headers

### 2.1 Standard Request Headers

Every REST HTTP request emitted by the Customer App **MUST** include the following standard headers:

| Header Name | Data Type | Required | Description & Example |
| :--- | :--- | :--- | :--- |
| `Authorization` | String | **Required** (for private routes) | JWT Bearer token: `Bearer <access_token>` |
| `Content-Type` | String | **Required** | `application/json` (or `multipart/form-data` for avatars/media uploads) |
| `Accept` | String | **Required** | `application/json` |
| `x-request-id` | String | Optional (Recommended) | `uuid-v4` identifier for end-to-end trace correlation |

### 2.2 Standard Unified Response Format

All REST responses conform to a strict, predictable JSON envelope.

#### Standard Success Response
```json
{
  "status": "success",
  "data": { ... },
  "message": "Operation completed successfully"
}
```

#### Standard Error Response
```json
{
  "status": "error",
  "code": "ERROR_CODE_IDENTIFIER",
  "message": "Human readable error description",
  "errors": [
    {
      "field": "phone",
      "message": "Phone number must be in E.164 format (+923001234567)"
    }
  ]
}
```

### 2.3 Common Status Codes & Error Codes

- `200 OK`: Request processed successfully.
- `201 Created`: Resource (e.g. booking, address, review) created.
- `400 Bad Request` (`VALIDATION_ERROR`): Invalid parameters or missing body keys.
- `401 Unauthorized` (`UNAUTHORIZED`): Token missing, expired, or invalid signature.
- `403 Forbidden` (`FORBIDDEN`): Authenticated user lacks `user` role access.
- `404 Not Found` (`NOT_FOUND`): Target entity (worker, booking, service) does not exist.
- `409 Conflict` (`ALREADY_EXISTS`): Duplicate entry (e.g. address already default).
- `422 Unprocessable Entity`: Business domain rule violation (e.g., cancelling an already completed booking).
- `429 Too Many Requests` (`RATE_LIMITED`): OTP or request quota exceeded.
- `500 Internal Error` (`SERVER_ERROR`): Server exception.

---

## 3. Module 1: Authentication & Session Lifecycle (`/api/v1/auth`)

Customer authentication uses passwordless phone-based OTP verification.

### 3.1 Request OTP Code
Generates a 6-digit SMS verification code for customer login/registration.

- **HTTP Method**: `POST`
- **Path**: `/api/v1/auth/otp/send`
- **Authentication**: Public (No JWT required)
- **Request Body Parameters**:

| Parameter | Type | Required | Description | Validation |
| :--- | :--- | :--- | :--- | :--- |
| `phone` | String | Yes | Mobile number | E.164 format (e.g., `+923001234567`) |

#### Request Example
```json
{
  "phone": "+923001234567"
}
```

#### Response Example (200 OK)
```json
{
  "status": "success",
  "message": "OTP sent successfully",
  "data": {
    "phone": "+923001234567",
    "expiresInSeconds": 300
  }
}
```

---

### 3.2 Verify OTP & Authenticate Customer
Verifies the SMS code. **NOTE**: Customer app MUST pass `"role": "customer"` (or `"user"`).

- **HTTP Method**: `POST`
- **Path**: `/api/v1/auth/otp/verify`
- **Authentication**: Public
- **Request Body Parameters**:

| Parameter | Type | Required | Description | Validation |
| :--- | :--- | :--- | :--- | :--- |
| `phone` | String | Yes | Mobile number | E.164 format |
| `otp` | String | Yes | Verification code | 6 numeric digits |
| `role` | String | Yes | Target user role | MUST be `"customer"` or `"user"` |

#### Request Example
```json
{
  "phone": "+923001234567",
  "otp": "123456",
  "role": "customer"
}
```

#### Response Example (200 OK)
```json
{
  "status": "success",
  "message": "Authentication successful",
  "data": {
    "user": {
      "id": "e81d4a1b-3f41-4b10-a928-874281989410",
      "phone": "+923001234567",
      "role": "user",
      "isVerified": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "refreshToken": "7a9b1c2d-3e4f-5678-90ab-cdef12345678",
    "expiresIn": 86400
  }
}
```

---

### 3.3 Refresh Access Token
Obtains a fresh JWT Access Token using an active Refresh Token.

- **HTTP Method**: `POST`
- **Path**: `/api/v1/auth/token/refresh`
- **Authentication**: Public
- **Request Body Parameters**:

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `refreshToken` | String | Yes | Active Refresh Token string |

#### Request Example
```json
{
  "refreshToken": "7a9b1c2d-3e4f-5678-90ab-cdef12345678"
}
```

#### Response Example (200 OK)
```json
{
  "status": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "expiresIn": 86400
  }
}
```

---

### 3.4 Logout Customer Session
Invalidates the current session and revokes the refresh token.

- **HTTP Method**: `POST`
- **Path**: `/api/v1/auth/user/logout`
- **Authentication**: Required (`Bearer <access_token>`)
- **Request Body**: Empty

#### Response Example (200 OK)
```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

---

## 4. Module 2: Customer Profile & User Management (`/api/v1/users`)

### 4.1 Get Customer Profile
Retrieves the logged-in customer's full profile details.

- **HTTP Method**: `GET`
- **Path**: `/api/v1/users/me`
- **Authentication**: Required (`Bearer <access_token>`)

#### Response Example (200 OK)
```json
{
  "status": "success",
  "data": {
    "id": "e81d4a1b-3f41-4b10-a928-874281989410",
    "phone": "+923001234567",
    "name": "Ahmed Ali",
    "email": "ahmed.ali@example.com",
    "avatar_url": "https://storage.tasklync.pk/avatars/customer_123.jpg",
    "preferred_language": "en",
    "preferred_currency": "PKR",
    "created_at": "2026-01-15T08:30:00.000Z"
  }
}
```

---

### 4.2 Update Profile Information
Updates editable personal profile information.

- **HTTP Method**: `PATCH`
- **Path**: `/api/v1/users/me`
- **Authentication**: Required (`Bearer <access_token>`)
- **Request Body Parameters**:

| Parameter | Type | Required | Description | Validation |
| :--- | :--- | :--- | :--- | :--- |
| `name` | String | Optional | Customer full name | Min 2, max 50 chars |
| `email` | String | Optional | Email address | Valid email format |
| `preferred_language` | String | Optional | App language | `'en'`, `'ur'`, or `'ar'` |
| `preferred_currency` | String | Optional | Preferred currency | `'PKR'` or `'USD'` |

#### Request Example
```json
{
  "name": "Ahmed Ali Khan",
  "email": "ahmed.khan@example.com",
  "preferred_language": "en",
  "preferred_currency": "PKR"
}
```

#### Response Example (200 OK)
```json
{
  "status": "success",
  "message": "Profile updated successfully",
  "data": {
    "id": "e81d4a1b-3f41-4b10-a928-874281989410",
    "name": "Ahmed Ali Khan",
    "email": "ahmed.khan@example.com",
    "preferred_language": "en",
    "preferred_currency": "PKR"
  }
}
```

---

### 4.3 Upload Profile Avatar
Uploads or updates the profile photo.

- **HTTP Method**: `POST`
- **Path**: `/api/v1/users/me/avatar`
- **Authentication**: Required (`Bearer <access_token>`)
- **Content-Type**: `multipart/form-data`
- **Form Data Parameters**:

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `avatar` | File | Yes | Image file (JPEG, PNG, WEBP, max 5MB) |

#### Response Example (200 OK)
```json
{
  "status": "success",
  "message": "Avatar uploaded successfully",
  "data": {
    "avatar_url": "https://storage.tasklync.pk/avatars/customer_123_v2.jpg"
  }
}
```

---

### 4.4 Get Notification Preferences
Retrieves customer communication and push notification settings.

- **HTTP Method**: `GET`
- **Path**: `/api/v1/users/me/preferences`
- **Authentication**: Required (`Bearer <access_token>`)

#### Response Example (200 OK)
```json
{
  "status": "success",
  "data": {
    "push_enabled": true,
    "email_enabled": true,
    "preferred_language": "en",
    "preferred_currency": "PKR"
  }
}
```

---

### 4.5 Update Notification Preferences
- **HTTP Method**: `PUT`
- **Path**: `/api/v1/users/me/preferences`
- **Authentication**: Required (`Bearer <access_token>`)
- **Request Body Parameters**:

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `push_enabled` | Boolean | Optional | Enable/disable push notifications |
| `email_enabled` | Boolean | Optional | Enable/disable email alerts |
| `preferred_language` | String | Optional | `'en'`, `'ur'`, `'ar'` |
| `preferred_currency` | String | Optional | `'PKR'`, `'USD'` |

---

### 4.6 Register FCM Push Token
Registers the mobile device Firebase Cloud Messaging (FCM) token for push notifications.

- **HTTP Method**: `POST`
- **Path**: `/api/v1/users/me/fcm-token`
- **Authentication**: Required (`Bearer <access_token>`)
- **Request Body Parameters**:

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `fcm_token` | String | Yes | Push registration token string |
| `device_type` | String | Optional | `'android'` or `'ios'` |

---

### 4.7 Block / Unblock Worker
- **Block**: `POST /api/v1/users/me/blocks/:workerId`
- **Unblock**: `DELETE /api/v1/users/me/blocks/:workerId`
- **Authentication**: Required (`Bearer <access_token>`)

---

## 5. Module 3: Saved Addresses & Delivery Locations (`/api/v1/users/me/addresses`)

Customers manage saved service locations (e.g. Home, Office, Parents) for seamless booking.

### 5.1 List Customer Saved Addresses
- **HTTP Method**: `GET`
- **Path**: `/api/v1/users/me/addresses`
- **Authentication**: Required (`Bearer <access_token>`)

#### Response Example (200 OK)
```json
{
  "status": "success",
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "label": "Home",
      "address_line": "House 42, Street 12, Sector F-8/3",
      "city": "Islamabad",
      "country": "Pakistan",
      "lat": 33.7182,
      "lng": 73.0605,
      "is_default": true,
      "created_at": "2026-02-01T10:00:00.000Z"
    }
  ]
}
```

---

### 5.2 Add New Saved Address
- **HTTP Method**: `POST`
- **Path**: `/api/v1/users/me/addresses`
- **Authentication**: Required (`Bearer <access_token>`)
- **Request Body Parameters**:

| Parameter | Type | Required | Description | Validation |
| :--- | :--- | :--- | :--- | :--- |
| `label` | String | Yes | Address tag (e.g., `'Home'`, `'Work'`) | Max 50 chars |
| `address_line` | String | Yes | Full street address text | Min 1 char |
| `city` | String | Optional | City name | String |
| `country` | String | Optional | Country name | Default: `'Pakistan'` |
| `lat` | Number | Yes | Geographic latitude | Min -90, max 90 |
| `lng` | Number | Yes | Geographic longitude | Min -180, max 180 |
| `is_default` | Boolean | Optional | Set as default address | Default: `false` |

#### Request Example
```json
{
  "label": "Office",
  "address_line": "Floor 4, Blue Area Commercial Complex",
  "city": "Islamabad",
  "lat": 33.7100,
  "lng": 73.0550,
  "is_default": false
}
```

---

### 5.3 Update Address
- **HTTP Method**: `PATCH`
- **Path**: `/api/v1/users/me/addresses/:id`
- **Authentication**: Required (`Bearer <access_token>`)

---

### 5.4 Delete Address
- **HTTP Method**: `DELETE`
- **Path**: `/api/v1/users/me/addresses/:id`
- **Authentication**: Required (`Bearer <access_token>`)

---

### 5.5 Set Default Address
- **HTTP Method**: `PATCH`
- **Path**: `/api/v1/users/me/addresses/:id/default`
- **Authentication**: Required (`Bearer <access_token>`)

---

## 6. Module 4: Service Catalog & Master Reference Data (`/api/v1/categories`, `/api/v1/services`, `/api/v1/skills`)

Public catalog endpoints used on the Home and Category Browsing screens.

### 6.1 List Service Categories
- **HTTP Method**: `GET`
- **Path**: `/api/v1/categories`
- **Authentication**: Public

#### Query Parameters:
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `activeOnly` | Boolean | Optional | Filter active categories (Default: `true`) |

#### Response Example (200 OK)
```json
{
  "status": "success",
  "data": [
    {
      "id": "electrician",
      "name": "Electrical Services",
      "slug": "electrical-services",
      "description": "Wiring, fixture installation, generators, and circuit repairs.",
      "icon_url": "https://cdn.tasklync.pk/icons/electrical.png",
      "is_active": true
    },
    {
      "id": "plumber",
      "name": "Plumbing Services",
      "slug": "plumbing-services",
      "description": "Pipe repair, water heater installation, and leak detection.",
      "icon_url": "https://cdn.tasklync.pk/icons/plumbing.png",
      "is_active": true
    }
  ]
}
```

---

### 6.2 Get Category Details & Sub-Services
- **HTTP Method**: `GET`
- **Path**: `/api/v1/categories/:id/services`
- **Authentication**: Public

#### Response Example (200 OK)
```json
{
  "status": "success",
  "data": [
    {
      "id": "7f8b9c0d-1234-5678-90ab-cdef12345678",
      "category_id": "electrician",
      "title": "Ceiling Fan Installation",
      "description": "Mounting and wiring of standard ceiling fan",
      "base_price": 1500,
      "price_unit": "PER_JOB"
    }
  ]
}
```

---

### 6.3 Get Service Detail
- **HTTP Method**: `GET`
- **Path**: `/api/v1/services/:id`
- **Authentication**: Public

---

### 6.4 List All Master Skills
- **HTTP Method**: `GET`
- **Path**: `/api/v1/skills`
- **Authentication**: Public

---

## 7. Module 5: Worker Search Engine & Discovery (`/api/v1/search`)

Provides geospatial proximity worker lookup and search autocomplete for customers.

### 7.1 Search Nearby Workers
Performs multi-criteria worker search based on location coordinates, category, minimum rating, and sorting.

- **HTTP Method**: `GET`
- **Path**: `/api/v1/search/workers`
- **Authentication**: Public

#### Query Parameters:

| Parameter | Type | Required | Description | Validation |
| :--- | :--- | :--- | :--- | :--- |
| `lat` | Number | **Yes** | Latitude | Min -90, max 90 |
| `lng` | Number | **Yes** | Longitude | Min -180, max 180 |
| `radiusKm` | Number | Optional | Search radius in kilometers | Default: `10`, max `50` |
| `categoryId` | String | Optional | Category identifier string | e.g. `'electrician'` |
| `serviceId` | String | Optional | Service UUID | UUID |
| `minRating` | Number | Optional | Minimum worker rating | 1.0 to 5.0 |
| `sortBy` | String | Optional | Sort field | `'distance'`, `'rating'`, `'price'` |
| `page` | Integer | Optional | Pagination page | Default: `1` |
| `limit` | Integer | Optional | Items per page | Default: `20`, max `50` |

#### Response Example (200 OK)
```json
{
  "status": "success",
  "data": {
    "workers": [
      {
        "worker_id": "d1e2f3a4-b5c6-7890-1234-567890abcdef",
        "name": "Muhammad Usman",
        "avatar_url": "https://storage.tasklync.pk/avatars/worker_99.jpg",
        "rating": 4.9,
        "review_count": 84,
        "hourly_rate": 1200,
        "is_verified": true,
        "distance_km": 2.4,
        "location": {
          "latitude": 33.7190,
          "longitude": 73.0610
        },
        "skills": ["AC Repair", "Circuit Wiring", "UPS Installation"]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

---

### 7.2 Search Autocomplete
Provides instant auto-suggestions when typing in the search bar.

- **HTTP Method**: `GET`
- **Path**: `/api/v1/search/autocomplete`
- **Authentication**: Public
- **Query Parameters**:
  - `q` (String, Required): Search query prefix (e.g., `'elec'`)

#### Response Example (200 OK)
```json
{
  "status": "success",
  "data": {
    "categories": [
      { "id": "electrician", "name": "Electrical Services" }
    ],
    "services": [
      { "id": "7f8b9c0d-1234-5678-90ab-cdef12345678", "title": "Electrical Wiring Repair" }
    ]
  }
}
```

---

### 7.3 Get Trending Searches
- **HTTP Method**: `GET`
- **Path**: `/api/v1/search/trending`
- **Authentication**: Public

---

## 8. Module 6: Worker Profiles & Public Information (`/api/v1/workers`)

Allows customers to inspect worker bio, verify identity status, review overall ratings, and inspect pricing before booking.

### 8.1 Get Worker Public Profile
- **HTTP Method**: `GET`
- **Path**: `/api/v1/workers/:id`
- **Authentication**: Public

#### Response Example (200 OK)
```json
{
  "status": "success",
  "data": {
    "id": "d1e2f3a4-b5c6-7890-1234-567890abcdef",
    "name": "Muhammad Usman",
    "avatar_url": "https://storage.tasklync.pk/avatars/worker_99.jpg",
    "bio": "Certified electrician with over 8 years of residential experience.",
    "is_verified": true,
    "rating": 4.9,
    "total_jobs_completed": 142,
    "hourly_rate": 1200,
    "joined_at": "2024-05-10T00:00:00.000Z"
  }
}
```

---

### 8.2 Get Worker Services & Offerings
- **HTTP Method**: `GET`
- **Path**: `/api/v1/workers/:id/services`
- **Authentication**: Public

---

### 8.3 Get Worker Availability Schedule
- **HTTP Method**: `GET`
- **Path**: `/api/v1/workers/:id/availability`
- **Authentication**: Public

---

## 9. Module 7: Booking Lifecycle Engine (`/api/v1/bookings`)

Core booking module responsible for pricing estimation, creating booking requests, tracking active jobs, and handling cancellations.

### Booking State Machine Lifecycle

```
[Customer Creates Request] ──> PENDING
                                  │
                  ┌───────────────┴───────────────┐
                  ▼                               ▼
       [Worker Accepts Job]             [Worker / User Cancels]
                  │                               │
                  ▼                               ▼
              ACCEPTED                        CANCELLED
                  │
                  ▼
         [Worker Starts Job]
                  │
                  ▼
             IN_PROGRESS
                  │
                  ▼
        [Worker Completes Job]
                  │
                  ▼
              COMPLETED
```

---

### 9.1 Get Price & Duration Estimate
Calculates estimated cost and duration before creating a booking request.

- **HTTP Method**: `GET`
- **Path**: `/api/v1/bookings/estimate`
- **Authentication**: Required (`Bearer <access_token>`)
- **Query Parameters**:

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `worker_id` | String (UUID) | Yes | Target worker UUID |
| `category_id` | String | Yes | Service category ID (e.g., `'electrician'`) |
| `service_id` | String (UUID) | Optional | Specific service UUID |
| `scheduled_at` | String (ISO) | Yes | Planned job execution time |
| `duration_hours` | Number | Yes | Estimated hours (0.5 to 12) |
| `latitude` | Number | Yes | Customer job location latitude |
| `longitude` | Number | Yes | Customer job location longitude |
| `is_urgent` | Boolean | Yes | `'true'` or `'false'` string |

#### Response Example (200 OK)
```json
{
  "status": "success",
  "data": {
    "base_amount": 2400,
    "urgent_surcharge": 500,
    "platform_fee": 150,
    "total_estimated_amount": 3050,
    "currency": "PKR",
    "estimated_duration_hours": 2
  }
}
```

---

### 9.2 Create Booking Request
Submits a formal job request to the selected worker.

- **HTTP Method**: `POST`
- **Path**: `/api/v1/bookings`
- **Authentication**: Required (`Bearer <access_token>`) - Role: `user`
- **Request Body Parameters**:

| Parameter | Type | Required | Description | Validation |
| :--- | :--- | :--- | :--- | :--- |
| `worker_id` | String (UUID) | Yes | Target worker ID | Valid UUID |
| `category_id` | String | Yes | Service category ID | Max 50 chars |
| `service_id` | String (UUID) | Optional | Service ID | Valid UUID |
| `service_type` | String | Yes | Service recurrence model | `'ONE_TIME'` or `'RECURRING'` |
| `scheduled_at` | String (ISO) | Yes | Job execution date/time | Future ISO8601 string |
| `duration_hours` | Number | Yes | Expected duration | 0.5 to 12.0 hours |
| `address_id` | String (UUID) | Yes | Customer saved address ID | Valid UUID |
| `address_text` | String | Yes | Full text location description | 5 to 500 chars |
| `latitude` | Number | Yes | Job location latitude | -90 to 90 |
| `longitude` | Number | Yes | Job location longitude | -180 to 180 |
| `is_urgent` | Boolean | Yes | Mark urgent job request | Boolean |
| `description` | String | Optional | Notes/Instructions for worker | Max 1000 chars |

#### Request Example
```json
{
  "worker_id": "d1e2f3a4-b5c6-7890-1234-567890abcdef",
  "category_id": "electrician",
  "service_id": "7f8b9c0d-1234-5678-90ab-cdef12345678",
  "service_type": "ONE_TIME",
  "scheduled_at": "2026-08-01T10:00:00.000Z",
  "duration_hours": 2,
  "address_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "address_text": "House 42, Street 12, Sector F-8/3, Islamabad",
  "latitude": 33.7182,
  "longitude": 73.0605,
  "is_urgent": false,
  "description": "Need assistance fixing short circuit in master bedroom."
}
```

#### Response Example (201 Created)
```json
{
  "status": "success",
  "message": "Booking request created successfully",
  "data": {
    "id": "b01c2d3e-4f56-7890-abcd-ef1234567890",
    "customer_id": "e81d4a1b-3f41-4b10-a928-874281989410",
    "worker_id": "d1e2f3a4-b5c6-7890-1234-567890abcdef",
    "status": "PENDING",
    "scheduled_at": "2026-08-01T10:00:00.000Z",
    "total_amount": 3050,
    "created_at": "2026-07-30T14:30:00.000Z"
  }
}
```

---

### 9.3 List Customer Bookings
Lists current and past bookings for the logged-in customer.

- **HTTP Method**: `GET`
- **Path**: `/api/v1/bookings`
- **Authentication**: Required (`Bearer <access_token>`)
- **Query Parameters**:

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | String | Optional | Filter by status: `PENDING`, `ACCEPTED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED` |
| `page` | Integer | Optional | Page number (Default: `1`) |
| `limit` | Integer | Optional | Items per page (Default: `20`) |

---

### 9.4 Get Booking Details
Retrieves complete detail of a specific booking.

- **HTTP Method**: `GET`
- **Path**: `/api/v1/bookings/:id`
- **Authentication**: Required (`Bearer <access_token>`)

---

### 9.5 Confirm Booking (After Worker Price Quote)
- **HTTP Method**: `PATCH`
- **Path**: `/api/v1/bookings/:id/confirm`
- **Authentication**: Required (`Bearer <access_token>`) - Role: `user`

---

### 9.6 Cancel Booking
Allows customer to cancel a booking request.

- **HTTP Method**: `PATCH`
- **Path**: `/api/v1/bookings/:id/cancel`
- **Authentication**: Required (`Bearer <access_token>`)
- **Request Body Parameters**:

| Parameter | Type | Required | Description | Validation |
| :--- | :--- | :--- | :--- | :--- |
| `reason` | String | Yes | Reason for cancellation | 1 to 500 chars |

#### Request Example
```json
{
  "reason": "Change of plans, no longer required."
}
```

---

### 9.7 Track Worker Live Location
Returns real-time GPS coordinates of the assigned worker while job is `ACCEPTED` or `IN_PROGRESS`.

- **HTTP Method**: `GET`
- **Path**: `/api/v1/bookings/:id/track`
- **Authentication**: Required (`Bearer <access_token>`)

#### Response Example (200 OK)
```json
{
  "status": "success",
  "data": {
    "booking_id": "b01c2d3e-4f56-7890-abcd-ef1234567890",
    "worker_id": "d1e2f3a4-b5c6-7890-1234-567890abcdef",
    "latitude": 33.7160,
    "longitude": 73.0590,
    "last_updated_at": "2026-07-30T14:32:10.000Z"
  }
}
```

---

## 10. Module 8: Dispute Management (`/api/v1/bookings/:id/dispute`)

Allows customers to open a formal complaint regarding incomplete work, damage, or misconduct.

### 10.1 Open Booking Dispute
- **HTTP Method**: `POST`
- **Path**: `/api/v1/bookings/:id/dispute`
- **Authentication**: Required (`Bearer <access_token>`) - Role: `user`
- **Request Body Parameters**:

| Parameter | Type | Required | Description | Validation |
| :--- | :--- | :--- | :--- | :--- |
| `reason` | String | Yes | Explanation of the dispute | 10 to 1000 chars |
| `evidence_urls` | Array[String] | Optional | URLs of photo evidence | Max 5 valid URLs |

#### Request Example
```json
{
  "reason": "Worker left without completing ceiling fan wiring despite marking completed.",
  "evidence_urls": [
    "https://storage.tasklync.pk/disputes/evidence_01.jpg"
  ]
}
```

---

### 10.2 View Dispute Status & Messages
- **HTTP Method**: `GET`
- **Path**: `/api/v1/bookings/:id/dispute`
- **Authentication**: Required (`Bearer <access_token>`)

---

## 11. Module 9: Payment Gateway & Saved Payment Methods (`/api/v1/payments`)

Handles online payment transactions, card management, and transaction receipts.

### 11.1 List Saved Payment Methods
- **HTTP Method**: `GET`
- **Path**: `/api/v1/payments/methods`
- **Authentication**: Required (`Bearer <access_token>`) - Role: `user`

#### Response Example (200 OK)
```json
{
  "status": "success",
  "data": [
    {
      "id": "pm_1N8x9y2eZvKYlo2C",
      "brand": "Visa",
      "last4": "4242",
      "exp_month": 12,
      "exp_year": 2028,
      "is_default": true
    }
  ]
}
```

---

### 11.2 Save New Payment Method
- **HTTP Method**: `POST`
- **Path**: `/api/v1/payments/methods`
- **Authentication**: Required (`Bearer <access_token>`) - Role: `user`
- **Request Body Parameters**:

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `payment_method_token` | String | Yes | Payment token from Stripe / JazzCash SDK |
| `is_default` | Boolean | Optional | Set as default method |

---

### 11.3 Set Default Payment Method
- **HTTP Method**: `PATCH`
- **Path**: `/api/v1/payments/methods/:id/default`
- **Authentication**: Required (`Bearer <access_token>`) - Role: `user`

---

### 11.4 Delete Payment Method
- **HTTP Method**: `DELETE`
- **Path**: `/api/v1/payments/methods/:id`
- **Authentication**: Required (`Bearer <access_token>`) - Role: `user`

---

### 11.5 Initiate Booking Payment
Executes payment charge for a completed or advance booking.

- **HTTP Method**: `POST`
- **Path**: `/api/v1/payments/initiate`
- **Authentication**: Required (`Bearer <access_token>`) - Role: `user`
- **Request Body Parameters**:

| Parameter | Type | Required | Description | Validation |
| :--- | :--- | :--- | :--- | :--- |
| `booking_id` | String (UUID) | Yes | Target booking UUID | Valid UUID |
| `payment_method_id` | String | Yes | Saved payment method ID or `'CASH'` | String |
| `amount` | Number | Yes | Total payment amount | Positive number |
| `currency` | String | Yes | Currency code | `'PKR'` or `'USD'` |

#### Request Example
```json
{
  "booking_id": "b01c2d3e-4f56-7890-abcd-ef1234567890",
  "payment_method_id": "pm_1N8x9y2eZvKYlo2C",
  "amount": 3050,
  "currency": "PKR"
}
```

---

### 11.6 Get Payment Transaction History
- **HTTP Method**: `GET`
- **Path**: `/api/v1/payments/history`
- **Authentication**: Required (`Bearer <access_token>`)

---

## 12. Module 10: Reviews & Rating System (`/api/v1/reviews`)

Enables customers to leave feedback, rating scores, and photo reviews for workers after booking completion.

### 12.1 Check Review Eligibility
Checks if customer can leave a review for a specific booking.

- **HTTP Method**: `GET`
- **Path**: `/api/v1/reviews/booking/:bookingId/eligibility`
- **Authentication**: Required (`Bearer <access_token>`) - Role: `user`

#### Response Example (200 OK)
```json
{
  "status": "success",
  "data": {
    "can_review": true,
    "booking_id": "b01c2d3e-4f56-7890-abcd-ef1234567890",
    "worker_id": "d1e2f3a4-b5c6-7890-1234-567890abcdef"
  }
}
```

---

### 12.2 Submit Review for Worker
- **HTTP Method**: `POST`
- **Path**: `/api/v1/reviews`
- **Authentication**: Required (`Bearer <access_token>`) - Role: `user`
- **Request Body Parameters**:

| Parameter | Type | Required | Description | Validation |
| :--- | :--- | :--- | :--- | :--- |
| `booking_id` | String (UUID) | Yes | Target completed booking ID | Valid UUID |
| `rating` | Integer | Yes | Star score rating | Integer from 1 to 5 |
| `comment` | String | Optional | Written feedback text | Max 2000 chars |
| `tags` | Array[String] | Optional | Predefined feedback tags | Array of valid tags |
| `photo_urls` | Array[String] | Optional | Attached photos | Max 5 valid URLs |

#### Request Example
```json
{
  "booking_id": "b01c2d3e-4f56-7890-abcd-ef1234567890",
  "rating": 5,
  "comment": "Punctual, professional, and fixed our wiring issue in under an hour!",
  "tags": ["PUNCTUAL", "PROFESSIONAL", "GREAT_COMMUNICATION"],
  "photo_urls": [
    "https://storage.tasklync.pk/reviews/photo_1.jpg"
  ]
}
```

---

### 12.3 Upload Review Media
Uploads photo before submitting review.

- **HTTP Method**: `POST`
- **Path**: `/api/v1/reviews/media`
- **Authentication**: Required (`Bearer <access_token>`) - Role: `user`
- **Content-Type**: `multipart/form-data`

---

### 12.4 Edit Submitted Review
- **HTTP Method**: `PATCH`
- **Path**: `/api/v1/reviews/:id`
- **Authentication**: Required (`Bearer <access_token>`) - Role: `user`

---

## 13. Module 11: Real-Time Chat & Socket.IO Gateway (`/api/v1/chat`)

Combines REST history lookup with Socket.IO bidirectional real-time messaging between Customer and Worker.

### 13.1 REST: Get Active Chat Rooms
- **HTTP Method**: `GET`
- **Path**: `/api/v1/chat/rooms`
- **Authentication**: Required (`Bearer <access_token>`)

---

### 13.2 REST: Get Room Messages History
- **HTTP Method**: `GET`
- **Path**: `/api/v1/chat/rooms/:bookingId/messages`
- **Authentication**: Required (`Bearer <access_token>`)
- **Query Parameters**:
  - `cursor` (String, Optional): Pagination message ID cursor
  - `limit` (Integer, Optional): Default `30`, max `100`

---

### 13.3 REST: Upload Chat Image Attachment
- **HTTP Method**: `POST`
- **Path**: `/api/v1/chat/rooms/:bookingId/messages/media`
- **Authentication**: Required (`Bearer <access_token>`)
- **Content-Type**: `multipart/form-data`

---

### 13.4 REST: Mark Room Messages as Read
- **HTTP Method**: `PATCH`
- **Path**: `/api/v1/chat/rooms/:bookingId/read`
- **Authentication**: Required (`Bearer <access_token>`)

---

### 13.5 Socket.IO Gateway Real-Time Specification

#### Handshake Connection Parameters
Customers connect to the root namespace with their JWT Bearer token:

```javascript
import { io } from "socket.io-client";

const socket = io("wss://api.tasklync.pk", {
  auth: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  },
  transports: ["websocket"]
});
```

#### Socket.IO Event Matrix

| Event Name | Direction | Payload Example / Schema | Description |
| :--- | :--- | :--- | :--- |
| `join_room` | Client ➔ Server | `{ "bookingId": "b01c2d3e-4f56-7890-abcd-ef1234567890" }` | Join booking chat channel |
| `send_message` | Client ➔ Server | `{ "bookingId": "...", "content": "Hello Usman!", "mediaUrl": null }` | Send text or media message |
| `typing` | Client ➔ Server | `{ "bookingId": "...", "isTyping": true }` | Broadcast typing indicator |
| `new_message` | Server ➔ Client | `{ "id": "msg_123", "senderId": "...", "content": "Hello!", "createdAt": "..." }` | Receive incoming chat message |
| `user_typing` | Server ➔ Client | `{ "bookingId": "...", "userId": "...", "isTyping": true }` | Worker typing status |
| `location_updated` | Server ➔ Client | `{ "bookingId": "...", "latitude": 33.718, "longitude": 73.060 }` | Real-time worker GPS stream |
| `booking_status_changed`| Server ➔ Client | `{ "bookingId": "...", "status": "ACCEPTED", "updatedAt": "..." }` | Instant booking state transition |

---

## 14. Module 12: In-App Notifications & FCM Integration (`/api/v1/notifications`)

### 14.1 List Customer Notifications Feed
- **HTTP Method**: `GET`
- **Path**: `/api/v1/notifications`
- **Authentication**: Required (`Bearer <access_token>`)
- **Query Parameters**: `page`, `limit`, `unreadOnly`

#### Response Example (200 OK)
```json
{
  "status": "success",
  "data": {
    "notifications": [
      {
        "id": "n101-202-303",
        "title": "Worker Accepted Your Booking!",
        "body": "Muhammad Usman has accepted your electrical repair request.",
        "type": "BOOKING_ACCEPTED",
        "is_read": false,
        "metadata": {
          "booking_id": "b01c2d3e-4f56-7890-abcd-ef1234567890"
        },
        "created_at": "2026-07-30T14:31:00.000Z"
      }
    ],
    "unread_count": 1
  }
}
```

---

### 14.2 Mark Single Notification Read
- **HTTP Method**: `PATCH`
- **Path**: `/api/v1/notifications/:id/read`
- **Authentication**: Required (`Bearer <access_token>`)

---

### 14.3 Mark All Notifications Read
- **HTTP Method**: `PATCH`
- **Path**: `/api/v1/notifications/read-all`
- **Authentication**: Required (`Bearer <access_token>`)

---

## 15. Customer App Production Connection Guide & Code Snippets

This section contains copy-paste, production-grade Flutter (Dart) and Axios (JavaScript/TypeScript) integration logic including JWT interceptors, automatic token refresh, error parsing, and Socket.IO connection handling.

### 15.1 Flutter / Dart - Complete API Client & Dio Setup

```dart
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiClient {
  static const String baseUrl = 'https://api.tasklync.pk/api/v1';
  final Dio dio = Dio(BaseOptions(
    baseUrl: baseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  ));

  final _storage = const FlutterSecureStorage();

  ApiClient() {
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final accessToken = await _storage.read(key: 'jwt_access_token');
          if (accessToken != null) {
            options.headers['Authorization'] = 'Bearer $accessToken';
          }
          return handler.next(options);
        },
        onError: (DioException error, handler) async {
          if (error.response?.statusCode == 401 && error.requestOptions.path != '/auth/token/refresh') {
            final refreshed = await _refreshToken();
            if (refreshed) {
              final newAccessToken = await _storage.read(key: 'jwt_access_token');
              error.requestOptions.headers['Authorization'] = 'Bearer $newAccessToken';
              final response = await dio.fetch(error.requestOptions);
              return handler.resolve(response);
            }
          }
          return handler.next(error);
        },
      ),
    );
  }

  Future<bool> _refreshToken() async {
    try {
      final refreshToken = await _storage.read(key: 'jwt_refresh_token');
      if (refreshToken == null) return false;

      final response = await Dio().post(
        '$baseUrl/auth/token/refresh',
        data: {'refreshToken': refreshToken},
      );

      if (response.statusCode == 200 && response.data['status'] == 'success') {
        final newAccessToken = response.data['data']['accessToken'];
        await _storage.write(key: 'jwt_access_token', value: newAccessToken);
        return true;
      }
    } catch (_) {}
    return false;
  }

  // ── Authentication Methods ──
  Future<Response> sendOtp(String phone) async {
    return await dio.post('/auth/otp/send', data: {'phone': phone});
  }

  Future<Response> verifyOtp(String phone, String otp) async {
    final response = await dio.post(
      '/auth/otp/verify',
      data: {'phone': phone, 'otp': otp, 'role': 'customer'},
    );
    if (response.statusCode == 200) {
      final data = response.data['data'];
      await _storage.write(key: 'jwt_access_token', value: data['accessToken']);
      await _storage.write(key: 'jwt_refresh_token', value: data['refreshToken']);
    }
    return response;
  }

  // ── Search & Booking Methods ──
  Future<Response> searchWorkers({
    required double lat,
    required double lng,
    String? categoryId,
    double radiusKm = 10,
  }) async {
    return await dio.get(
      '/search/workers',
      queryParameters: {
        'lat': lat,
        'lng': lng,
        'radiusKm': radiusKm,
        if (categoryId != null) 'categoryId': categoryId,
      },
    );
  }

  Future<Response> createBooking(Map<String, dynamic> bookingPayload) async {
    return await dio.post('/bookings', data: bookingPayload);
  }
}
```

---

### 15.2 Flutter / Dart - Real-Time Socket.IO Client

```dart
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class RealtimeChatService {
  IO.Socket? socket;
  final _storage = const FlutterSecureStorage();

  Future<void> connect() async {
    final token = await _storage.read(key: 'jwt_access_token');

    socket = IO.io('https://api.tasklync.pk', 
      IO.OptionBuilder()
        .setTransports(['websocket'])
        .setAuth({'token': token})
        .enableAutoConnect()
        .build()
    );

    socket?.onConnect((_) {
      print('⚡ Socket connected successfully');
    });

    socket?.on('new_message', (data) {
      print('📩 New incoming message: $data');
    });

    socket?.on('location_updated', (data) {
      print('📍 Worker live GPS update: ${data['latitude']}, ${data['longitude']}');
    });

    socket?.on('booking_status_changed', (data) {
      print('🔔 Booking status changed to: ${data['status']}');
    });

    socket?.onDisconnect((_) => print('❌ Socket disconnected'));
  }

  void joinBookingRoom(String bookingId) {
    socket?.emit('join_room', {'bookingId': bookingId});
  }

  void sendMessage(String bookingId, String content) {
    socket?.emit('send_message', {
      'bookingId': bookingId,
      'content': content,
      'mediaUrl': null,
    });
  }

  void disconnect() {
    socket?.disconnect();
  }
}
```

---

### 15.3 TypeScript / Axios Client Setup

```typescript
import axios from 'axios';

const API_BASE_URL = 'https://api.tasklync.pk/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Handle Token Refresh & Retries
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('jwt_refresh_token');
        const res = await axios.post(`${API_BASE_URL}/auth/token/refresh`, { refreshToken });
        if (res.data.status === 'success') {
          const newToken = res.data.data.accessToken;
          localStorage.setItem('jwt_access_token', newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshErr) {
        localStorage.removeItem('jwt_access_token');
        localStorage.removeItem('jwt_refresh_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

---

## 📌 Document Revision History

| Version | Date | Changes Summary | Author |
| :--- | :--- | :--- | :--- |
| `1.0.0` | 2026-01-10 | Initial REST draft specification | Backend Engineering Team |
| `2.0.0` | 2026-07-30 | Complete architecture overhaul: API Gateway routing, Socket.IO gateway, dispute management, geofenced worker search, and production Dio/Axios integration snippets. | Principal Backend Engineer |
