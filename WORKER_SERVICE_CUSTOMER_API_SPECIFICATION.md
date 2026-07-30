# 👷 TaskLync Worker Service - Customer App API Specification & Integration Guide

> **Author:** Principal Backend Engineer  
> **Target Microservice:** `worker-service` (Internal Port: 3002 | Access via API Gateway: 3000/443)  
> **Target Audience:** Mobile Engineers (Flutter / React Native), Frontend Web Integrators, QA Engineers  
> **Specification Version:** 2.0.0  

---

## 📋 Table of Contents
1. [Overview & Gateway Architecture](#1-overview--gateway-architecture)
2. [Global Request Headers & Response Standards](#2-global-request-headers--response-standards)
3. [Module 1: Service Categories Catalog (`/api/v1/categories`)](#3-module-1-service-categories-catalog-apiv1categories)
4. [Module 2: Master Service Details (`/api/v1/services`)](#4-module-2-master-service-details-apiv1services)
5. [Module 3: Master Skills & Offerings Catalog (`/api/v1/skills`, `/api/v1/offerings`)](#5-module-3-master-skills--offerings-catalog-apiv1skills-apiv1offerings)
6. [Module 4: Worker Search & Autocomplete Engine (`/api/v1/search`)](#6-module-4-worker-search--autocomplete-engine-apiv1search)
7. [Module 5: Geofenced Proximity Worker Search (`/api/v1/workers/nearby`)](#7-module-5-geofenced-proximity-worker-search-apiv1workersnearby)
8. [Module 6: Worker Public Profile & Identity (`/api/v1/workers/:id`)](#8-module-6-worker-public-profile--identity-apiv1workersid)
9. [Module 7: Worker Offered Services & Pricing (`/api/v1/workers/:id/services`)](#9-module-7-worker-offered-services--pricing-apiv1workersidservices)
10. [Module 8: Worker Public Skills (`/api/v1/workers/:id/skills`)](#10-module-8-worker-public-skills-apiv1workersidskills)
11. [Module 9: Worker Portfolio Gallery (`/api/v1/workers/:id/portfolio`)](#11-module-9-worker-portfolio-gallery-apiv1workersidportfolio)
12. [Module 10: Worker Reviews Feed (`/api/v1/workers/:id/reviews`)](#12-module-10-worker-reviews-feed-apiv1workersidreviews)
13. [How to Connect & Production Integration Code Snippets](#13-how-to-connect--production-integration-code-snippets)

---

## 1. Overview & Gateway Architecture

The `worker-service` maintains the master catalog of service categories, individual service definitions, master skill registries, worker profiles, pricing offerings, portfolio media, and geospatial location data.

Although `worker-service` runs internally on port `3002`, **the Customer Application MUST route all HTTP requests through the API Gateway** on port `3000` (or `443` in production).

```
┌─────────────────────────────────┐
│     Customer Mobile / Web       │
└────────────────┬────────────────┘
                 │
                 │ HTTPS (Port 3000 / 443)
                 ▼
┌─────────────────────────────────┐
│      TaskLync API Gateway       │
└────────────────┬────────────────┘
                 │
                 │ Internal Proxy Route
                 ▼
┌─────────────────────────────────┐
│     Worker Service (Port 3002)  │
│  - Categories & Services        │
│  - Geofenced Proximity Search   │
│  - Worker Public Profiles       │
│  - Offerings & Custom Pricing   │
│  - Skill Master Registry        │
└─────────────────────────────────┘
```

### Base URLs

| Environment | Base Gateway URL | Direct Route Prefix |
| :--- | :--- | :--- |
| **Local Development** | `http://localhost:3000/api/v1` | `/api/v1/workers`, `/api/v1/categories`, `/api/v1/services`, `/api/v1/search` |
| **Staging / QA** | `https://staging-api.tasklync.pk/api/v1` | `/api/v1/workers`, `/api/v1/categories`, `/api/v1/services`, `/api/v1/search` |
| **Production** | `https://api.tasklync.pk/api/v1` | `/api/v1/workers`, `/api/v1/categories`, `/api/v1/services`, `/api/v1/search` |

---

## 2. Global Request Headers & Response Standards

### 2.1 HTTP Request Headers

Most `worker-service` endpoints consumed by the Customer App are **public read-only routes** (such as category browsing, search, worker profile lookup), while authenticated routes require a Bearer token.

| Header Name | Type | Requirement | Description |
| :--- | :--- | :--- | :--- |
| `Authorization` | String | Optional for public / Required for private | `Bearer <access_token>` |
| `Content-Type` | String | Required | `application/json` |
| `Accept` | String | Required | `application/json` |
| `x-request-id` | String | Optional | UUID for trace correlation |

### 2.2 Standard Success Response Envelope
```json
{
  "status": "success",
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### 2.3 Standard Error Response Envelope
```json
{
  "status": "error",
  "code": "VALIDATION_ERROR | NOT_FOUND | SERVER_ERROR",
  "message": "Human readable error description",
  "errors": [
    {
      "field": "lat",
      "message": "Latitude must be between -90 and 90"
    }
  ]
}
```

---

## 3. Module 1: Service Categories Catalog (`/api/v1/categories`)

Service categories represent top-level job classifications shown on the Customer App homepage (e.g. Electrician, Plumber, AC Repair, Cleaning).

### 3.1 List Active Categories
Fetches all active top-level service categories.

- **HTTP Method**: `GET`
- **Path**: `/api/v1/categories`
- **Authentication**: Public (No JWT required)
- **Query Parameters**:

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `activeOnly` | Boolean | Optional | `true` | Return only active categories |

#### Request Example
`GET https://api.tasklync.pk/api/v1/categories?activeOnly=true`

#### Response Example (200 OK)
```json
{
  "status": "success",
  "data": [
    {
      "id": "electrician",
      "name": "Electrician",
      "slug": "electrician",
      "description": "Wiring repair, light fixture mounting, UPS installation, and circuit troubleshooting.",
      "icon_url": "https://storage.tasklync.pk/categories/electrician.png",
      "is_active": true,
      "created_at": "2026-01-01T00:00:00.000Z"
    },
    {
      "id": "plumber",
      "name": "Plumber",
      "slug": "plumber",
      "description": "Pipe leaks, sanitary fitting installation, geyser repair, and motor maintenance.",
      "icon_url": "https://storage.tasklync.pk/categories/plumber.png",
      "is_active": true,
      "created_at": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 3.2 Get Category Details by ID
- **HTTP Method**: `GET`
- **Path**: `/api/v1/categories/:id`
- **Authentication**: Public
- **Path Parameters**:
  - `id` (String, Required): Category ID (e.g. `'electrician'`, `'plumber'`)

---

### 3.3 Get Sub-Services for a Category
Retrieves standard predefined sub-services belonging to a category (e.g. Ceiling Fan Installation under Electrician).

- **HTTP Method**: `GET`
- **Path**: `/api/v1/categories/:id/services`
- **Authentication**: Public
- **Path Parameters**:
  - `id` (String, Required): Category ID

#### Response Example (200 OK)
```json
{
  "status": "success",
  "data": [
    {
      "id": "c7a8b4f1-9012-4e89-b123-112233445566",
      "category_id": "electrician",
      "title": "Ceiling Fan Installation",
      "description": "Standard mounting and wiring of indoor ceiling fan.",
      "base_price": 1500,
      "price_unit": "PER_JOB"
    },
    {
      "id": "d8e9f0a1-2345-6789-abcd-ef0123456789",
      "category_id": "electrician",
      "title": "UPS & Inverter Wiring",
      "description": "Complete backup wiring setup for home UPS.",
      "base_price": 2500,
      "price_unit": "PER_JOB"
    }
  ]
}
```

---

## 4. Module 2: Master Service Details (`/api/v1/services`)

### 4.1 Get Single Service Details
- **HTTP Method**: `GET`
- **Path**: `/api/v1/services/:id`
- **Authentication**: Public
- **Path Parameters**:
  - `id` (String UUID, Required): Service UUID

#### Response Example (200 OK)
```json
{
  "status": "success",
  "data": {
    "id": "c7a8b4f1-9012-4e89-b123-112233445566",
    "category_id": "electrician",
    "title": "Ceiling Fan Installation",
    "description": "Standard mounting and wiring of indoor ceiling fan.",
    "base_price": 1500,
    "price_unit": "PER_JOB",
    "estimated_duration_hours": 1
  }
}
```

---

## 5. Module 3: Master Skills & Offerings Catalog (`/api/v1/skills`, `/api/v1/offerings`)

### 5.1 List All Available Master Skills
- **HTTP Method**: `GET`
- **Path**: `/api/v1/skills`
- **Authentication**: Public

---

### 5.2 List Predefined Master Offerings
- **HTTP Method**: `GET`
- **Path**: `/api/v1/offerings`
- **Authentication**: Public

---

## 6. Module 4: Worker Search & Autocomplete Engine (`/api/v1/search`)

Power the customer app's search bar, autocomplete suggestions, and global query discovery.

### 6.1 Text Search for Workers & Services
- **HTTP Method**: `GET`
- **Path**: `/api/v1/search/workers`
- **Authentication**: Public
- **Query Parameters**:

| Parameter | Type | Required | Default | Validation & Description |
| :--- | :--- | :--- | :--- | :--- |
| `q` | String | **Yes** | - | Search query text (e.g. `'wiring'`, `'plumber'`) |
| `lat` | Number | Optional | - | Latitude (-90 to 90) |
| `lng` | Number | Optional | - | Longitude (-180 to 180) |
| `radius` | Number | Optional | `5000` | Search radius in meters (max 50,000m) |
| `category` | String | Optional | - | Category filter string |
| `page` | Integer | Optional | `1` | Page number |
| `limit` | Integer | Optional | `20` | Items per page (max 50) |

#### Request Example
`GET https://api.tasklync.pk/api/v1/search/workers?q=fan&lat=33.7182&lng=73.0605&radius=10000`

---

### 6.2 Instant Autocomplete Suggestions
- **HTTP Method**: `GET`
- **Path**: `/api/v1/search/autocomplete`
- **Authentication**: Public
- **Query Parameters**:

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `q` | String | **Yes** | - | Query prefix |
| `lat` | Number | Optional | - | Latitude |
| `lng` | Number | Optional | - | Longitude |
| `limit` | Integer | Optional | `10` | Max results |

---

### 6.3 Get Trending Search Suggestions
- **HTTP Method**: `GET`
- **Path**: `/api/v1/search/trending`
- **Authentication**: Public

---

## 7. Module 5: Geofenced Proximity Worker Search (`/api/v1/workers/nearby`)

Allows customers to discover active, nearby verified workers based on geographic radius and ratings.

- **HTTP Method**: `GET`
- **Path**: `/api/v1/workers/nearby`
- **Authentication**: Public
- **Query Parameters**:

| Parameter | Type | Required | Default | Validation & Description |
| :--- | :--- | :--- | :--- | :--- |
| `lat` | Number | **Yes** | - | Customer Latitude (-90 to 90) |
| `lng` | Number | **Yes** | - | Customer Longitude (-180 to 180) |
| `radius` | Number | Optional | `5000` | Proximity radius in meters (max 20,000m) |
| `category` | String | Optional | - | Category filter (e.g. `'electrician'`) |
| `serviceId` | String | Optional | - | Service UUID filter |
| `minRating` | Number | Optional | - | Minimum rating filter (1.0 to 5.0) |
| `page` | Integer | Optional | `1` | Page number |
| `limit` | Integer | Optional | `20` | Workers per page (max 50) |

#### Request Example
`GET https://api.tasklync.pk/api/v1/workers/nearby?lat=33.7182&lng=73.0605&radius=5000&category=electrician&minRating=4.5`

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
        "distance_meters": 2400,
        "location": {
          "latitude": 33.7190,
          "longitude": 73.0610
        },
        "skills": ["Electrician", "Circuit Repairs"]
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

## 8. Module 6: Worker Public Profile & Identity (`/api/v1/workers/:id`)

Fetches detailed public profile information for a specific worker when selected by the customer.

- **HTTP Method**: `GET`
- **Path**: `/api/v1/workers/:id`
- **Authentication**: Public
- **Path Parameters**:
  - `id` (String UUID, Required): Worker ID

#### Response Example (200 OK)
```json
{
  "status": "success",
  "data": {
    "id": "d1e2f3a4-b5c6-7890-1234-567890abcdef",
    "name": "Muhammad Usman",
    "avatar_url": "https://storage.tasklync.pk/avatars/worker_99.jpg",
    "bio": "Certified master electrician with 8 years experience in residential and commercial power systems.",
    "is_verified": true,
    "rating": 4.9,
    "total_jobs_completed": 142,
    "hourly_rate": 1200,
    "experience_years": 8,
    "languages": ["Urdu", "English", "Punjabi"],
    "created_at": "2024-05-10T00:00:00.000Z"
  }
}
```

---

## 9. Module 7: Worker Offered Services & Pricing (`/api/v1/workers/:id/services`)

Fetches the specific services offered by a worker along with their custom pricing.

- **HTTP Method**: `GET`
- **Path**: `/api/v1/workers/:id/services`
- **Authentication**: Public
- **Path Parameters**:
  - `id` (String UUID, Required): Worker ID

#### Response Example (200 OK)
```json
{
  "status": "success",
  "data": [
    {
      "offering_id": "off_998877",
      "service_id": "c7a8b4f1-9012-4e89-b123-112233445566",
      "title": "Ceiling Fan Installation",
      "custom_price": 1800,
      "price_unit": "PER_JOB",
      "notes": "Includes safety bracket verification."
    }
  ]
}
```

---

## 10. Module 8: Worker Public Skills (`/api/v1/workers/:id/skills`)

- **HTTP Method**: `GET`
- **Path**: `/api/v1/workers/:id/skills`
- **Authentication**: Public

#### Response Example (200 OK)
```json
{
  "status": "success",
  "data": [
    {
      "skill_id": "electrician",
      "name": "Electrician",
      "experience_level": "EXPERT"
    }
  ]
}
```

---

## 11. Module 9: Worker Portfolio Gallery (`/api/v1/workers/:id/portfolio`)

Retrieves proof of work / portfolio photos uploaded by the worker.

- **HTTP Method**: `GET`
- **Path**: `/api/v1/workers/:id/portfolio`
- **Authentication**: Public

#### Response Example (200 OK)
```json
{
  "status": "success",
  "data": [
    {
      "id": "port_01",
      "title": "DB Box Rewiring - Sector F-8",
      "image_url": "https://storage.tasklync.pk/portfolio/worker_99_job1.jpg",
      "created_at": "2026-03-12T00:00:00.000Z"
    }
  ]
}
```

---

## 12. Module 10: Worker Reviews Feed (`/api/v1/workers/:id/reviews`)

Retrieves public customer reviews and rating breakdowns for a worker.

- **HTTP Method**: `GET`
- **Path**: `/api/v1/workers/:id/reviews`
- **Authentication**: Public
- **Query Parameters**:

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `page` | Integer | Optional | `1` | Page number |
| `limit` | Integer | Optional | `20` | Items per page |

#### Response Example (200 OK)
```json
{
  "status": "success",
  "data": {
    "reviews": [
      {
        "id": "rev_101",
        "customer_name": "Ali Raza",
        "rating": 5,
        "comment": "Quick work and super clean execution!",
        "created_at": "2026-06-15T12:00:00.000Z"
      }
    ],
    "rating_summary": {
      "average_rating": 4.9,
      "total_reviews": 84,
      "5_star_count": 78,
      "4_star_count": 6
    }
  }
}
```

---

## 13. How to Connect & Production Integration Code Snippets

### 13.1 Production Integration Flow

1. **Host Configuration**: Point your API client to the API Gateway domain (`https://api.tasklync.pk/api/v1`).
2. **Category Loading**: Fetch categories (`GET /categories`) on application start to render category grid cards on the customer home screen.
3. **Proximity Search**: Use device GPS (`lat`, `lng`) to fetch nearby available workers (`GET /workers/nearby`) and render interactive markers on a map view.
4. **Worker Details**: When a customer taps a worker card or map pin, fetch worker details in parallel:
   - Worker profile: `GET /workers/:id`
   - Services offered: `GET /workers/:id/services`
   - Customer reviews: `GET /workers/:id/reviews`
   - Portfolio gallery: `GET /workers/:id/portfolio`

---

### 13.2 Flutter / Dart Integration Service Class

```dart
import 'package:dio/dio.dart';

class WorkerServiceApi {
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

  /// Fetch active top-level service categories
  Future<List<dynamic>> getCategories() async {
    final response = await dio.get('/categories', queryParameters: {'activeOnly': true});
    if (response.statusCode == 200 && response.data['status'] == 'success') {
      return response.data['data'];
    }
    throw Exception('Failed to load categories');
  }

  /// Search nearby workers using customer GPS coordinates
  Future<Map<String, dynamic>> getNearbyWorkers({
    required double lat,
    required double lng,
    double radiusMeters = 5000,
    String? category,
    double? minRating,
  }) async {
    final response = await dio.get(
      '/workers/nearby',
      queryParameters: {
        'lat': lat,
        'lng': lng,
        'radius': radiusMeters,
        if (category != null) 'category': category,
        if (minRating != null) 'minRating': minRating,
      },
    );
    if (response.statusCode == 200 && response.data['status'] == 'success') {
      return response.data['data'];
    }
    throw Exception('Failed to search nearby workers');
  }

  /// Fetch full profile details of a single worker
  Future<Map<String, dynamic>> getWorkerProfile(String workerId) async {
    final response = await dio.get('/workers/$workerId');
    if (response.statusCode == 200 && response.data['status'] == 'success') {
      return response.data['data'];
    }
    throw Exception('Failed to load worker profile');
  }

  /// Fetch custom service offerings and pricing for a worker
  Future<List<dynamic>> getWorkerServices(String workerId) async {
    final response = await dio.get('/workers/$workerId/services');
    if (response.statusCode == 200 && response.data['status'] == 'success') {
      return response.data['data'];
    }
    throw Exception('Failed to load worker services');
  }
}
```

---

### 13.3 TypeScript Integration Service Class

```typescript
import axios from 'axios';

const API_BASE_URL = 'https://api.tasklync.pk/api/v1';

export const workerServiceClient = {
  // Fetch active categories
  getCategories: async () => {
    const res = await axios.get(`${API_BASE_URL}/categories`, { params: { activeOnly: true } });
    return res.data.data;
  },

  // Search nearby workers
  getNearbyWorkers: async (lat: number, lng: number, category?: string, radius: number = 5000) => {
    const res = await axios.get(`${API_BASE_URL}/workers/nearby`, {
      params: { lat, lng, category, radius }
    });
    return res.data.data;
  },

  // Get single worker public profile
  getWorkerProfile: async (workerId: string) => {
    const res = await axios.get(`${API_BASE_URL}/workers/${workerId}`);
    return res.data.data;
  },

  // Get worker offerings & pricing
  getWorkerServices: async (workerId: string) => {
    const res = await axios.get(`${API_BASE_URL}/workers/${workerId}/services`);
    return res.data.data;
  }
};
```

---

## 📌 Document Revision History

| Version | Date | Changes Summary | Author |
| :--- | :--- | :--- | :--- |
| `1.0.0` | 2026-01-15 | Initial worker service route mapping | Backend Team |
| `2.0.0` | 2026-07-30 | Standalone Customer-facing `worker-service` API specification with proximity search, offerings lookup, and Flutter integration snippets. | Principal Backend Engineer |
