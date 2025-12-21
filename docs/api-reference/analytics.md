# Analytics API Reference

Complete reference for all analytics endpoints.

## Base URL

```
/api/analytics
```

All endpoints require authentication. See [Security Documentation](../security.md) for authentication details.

## Endpoints

### Overview

Get comprehensive analytics overview.

**Endpoint**: `GET /api/analytics/overview`

**Example Request**:
```bash
curl -H "X-API-Key: your-api-key" \
  "http://localhost:3000/api/analytics/overview"
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "totalContacts": 1000,
    "totalBloodGroups": 8,
    "totalLobbies": 15,
    "totalDesignations": 20,
    "recentContacts": 50,
    "contactsThisMonth": 100
  }
}
```

---

### Blood Group Distribution

Get distribution of contacts by blood group.

**Endpoint**: `GET /api/analytics/blood-groups`

**Example Request**:
```bash
curl -H "X-API-Key: your-api-key" \
  "http://localhost:3000/api/analytics/blood-groups"
```

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "bloodGroup": "A+",
      "count": 250,
      "percentage": 25.0
    },
    {
      "bloodGroup": "B+",
      "count": 200,
      "percentage": 20.0
    },
    {
      "bloodGroup": "O+",
      "count": 300,
      "percentage": 30.0
    }
  ]
}
```

---

### Lobby Distribution

Get distribution of contacts by lobby.

**Endpoint**: `GET /api/analytics/lobbies`

**Example Request**:
```bash
curl -H "X-API-Key: your-api-key" \
  "http://localhost:3000/api/analytics/lobbies"
```

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "lobby": "Engineering",
      "count": 150,
      "percentage": 15.0
    },
    {
      "lobby": "Sales",
      "count": 120,
      "percentage": 12.0
    },
    {
      "lobby": "Marketing",
      "count": 100,
      "percentage": 10.0
    }
  ]
}
```

---

### Designation Distribution

Get distribution of contacts by designation.

**Endpoint**: `GET /api/analytics/designations`

**Example Request**:
```bash
curl -H "X-API-Key: your-api-key" \
  "http://localhost:3000/api/analytics/designations"
```

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "designation": "Manager",
      "count": 200,
      "percentage": 20.0
    },
    {
      "designation": "Director",
      "count": 50,
      "percentage": 5.0
    },
    {
      "designation": "Engineer",
      "count": 300,
      "percentage": 30.0
    }
  ]
}
```

---

### Contacts Growth

Get contacts growth over time.

**Endpoint**: `GET /api/analytics/growth`

**Query Parameters**:
- `days` (number, optional): Number of days to analyze (default: 30, max: 365)

**Example Request**:
```bash
curl -H "X-API-Key: your-api-key" \
  "http://localhost:3000/api/analytics/growth?days=30"
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "period": "30 days",
    "totalContacts": 1000,
    "newContacts": 100,
    "growthRate": 10.0,
    "dailyGrowth": [
      {
        "date": "2024-01-01",
        "count": 10
      },
      {
        "date": "2024-01-02",
        "count": 15
      }
    ]
  }
}
```

**Error Responses**:
- `400`: Invalid days parameter (must be 1-365)

---

### Recent Contacts

Get recently created contacts.

**Endpoint**: `GET /api/analytics/recent`

**Query Parameters**:
- `limit` (number, optional): Number of contacts to return (default: 10, max: 100)

**Example Request**:
```bash
curl -H "X-API-Key: your-api-key" \
  "http://localhost:3000/api/analytics/recent?limit=10"
```

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "phone": "1234567890",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 10
}
```

---

### Increment Visit Count

Increment the visit counter (thread-safe).

**Endpoint**: `POST /api/analytics/visits`

**Headers**:
- `X-API-Key`: Your API key
- `X-CSRF-Token`: CSRF token
- `Content-Type`: application/json

**Example Request**:
```bash
curl -X POST \
  -H "X-API-Key: your-api-key" \
  -H "X-CSRF-Token: csrf-token" \
  "http://localhost:3000/api/analytics/visits"
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "count": 1001,
    "message": "Visit count incremented"
  }
}
```

---

### Get Visit Count

Get current visit count.

**Endpoint**: `GET /api/analytics/visits`

**Example Request**:
```bash
curl -H "X-API-Key: your-api-key" \
  "http://localhost:3000/api/analytics/visits"
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "count": 1000,
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Days must be between 1 and 365"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Invalid CSRF token"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "requestId": "req-123456"
}
```

