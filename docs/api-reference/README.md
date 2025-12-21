# API Reference

Complete API reference documentation for the Contact Management API.

## Overview

The API is organized into three main resource groups:

- **[Contacts API](contacts.md)** - Contact management operations
- **[Documents API](documents.md)** - Document management operations
- **[Analytics API](analytics.md)** - Analytics and insights

## Base URLs

- **Contacts**: `/api/contacts`
- **Documents**: `/api/documents`
- **Analytics**: `/api/analytics`

## Authentication

All endpoints (except health check) require authentication. See [Security Documentation](../security.md) for details.

**Methods**:
- API Key: `X-API-Key` header
- Basic Auth: `Authorization: Basic <credentials>`

## Common Patterns

### Request Format

All requests use JSON format:
```json
{
  "field": "value"
}
```

### Response Format

Success responses:
```json
{
  "success": true,
  "data": {...}
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error message",
  "errors": [...]
}
```

### Pagination

Paginated endpoints accept:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 50, max: 100)

Response includes:
```json
{
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "totalPages": 2
  }
}
```

### CSRF Protection

State-changing operations (POST, PUT, DELETE) require CSRF token:

1. Get token: `GET /api/csrf-token`
2. Include in header: `X-CSRF-Token: <token>`

## Rate Limits

- **General Endpoints**: 100 requests/minute
- **Bulk Operations**: 10 requests/minute
- **Strict Operations**: 5 requests/minute

## Error Codes

- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (CSRF token invalid)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Quick Links

- [Contacts API](contacts.md) - Full contact management API
- [Documents API](documents.md) - Document management API
- [Analytics API](analytics.md) - Analytics endpoints
- [Security Guide](../security.md) - Authentication and security
- [Getting Started](../getting-started.md) - Setup and installation

