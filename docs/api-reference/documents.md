# Documents API Reference

Complete reference for all document management endpoints.

## Base URL

```
/api/documents
```

All endpoints require authentication. See [Security Documentation](../security.md) for authentication details.

## Endpoints

### List Documents (Paginated)

Get all documents with pagination.

**Endpoint**: `GET /api/documents`

**Query Parameters**:
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 50, max: 100)

**Example Request**:
```bash
curl -H "X-API-Key: your-api-key" \
  "http://localhost:3000/api/documents?page=1&limit=50"
```

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Document Title",
      "link": "https://example.com/document.pdf",
      "uploadedBy": "admin",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "totalPages": 2
  }
}
```

---

### List All Documents (No Pagination)

Get all documents without pagination.

**Endpoint**: `GET /api/documents/all`

**Example Request**:
```bash
curl -H "X-API-Key: your-api-key" \
  "http://localhost:3000/api/documents/all"
```

**Example Response**:
```json
{
  "success": true,
  "data": [...],
  "count": 100
}
```

---

### Get Document by ID

Get a single document by its ID.

**Endpoint**: `GET /api/documents/:id`

**Path Parameters**:
- `id` (string, required): Document UUID

**Example Request**:
```bash
curl -H "X-API-Key: your-api-key" \
  "http://localhost:3000/api/documents/uuid"
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Document Title",
    "link": "https://example.com/document.pdf",
    "uploadedBy": "admin",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses**:
- `404`: Document not found

---

### Search Documents

Search documents by title (partial match, case-insensitive).

**Endpoint**: `GET /api/documents/search`

**Query Parameters**:
- `query` (string, required): Search query
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 50, max: 100)

**Example Request**:
```bash
curl -H "X-API-Key: your-api-key" \
  "http://localhost:3000/api/documents/search?query=report&page=1&limit=50"
```

**Example Response**:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 5,
    "totalPages": 1
  }
}
```

---

### Get Document Count

Get total number of documents.

**Endpoint**: `GET /api/documents/count`

**Example Request**:
```bash
curl -H "X-API-Key: your-api-key" \
  "http://localhost:3000/api/documents/count"
```

**Example Response**:
```json
{
  "success": true,
  "count": 100
}
```

---

## Admin Endpoints

### Create Document

Create a new document.

**Endpoint**: `POST /api/documents/admin/createDocument`

**Headers**:
- `X-API-Key`: Your API key
- `X-CSRF-Token`: CSRF token (get from `/api/csrf-token`)
- `Content-Type`: application/json

**Request Body**:
```json
{
  "title": "Document Title",
  "link": "https://example.com/document.pdf",
  "uploadedBy": "admin"
}
```

**Field Validation**:
- `title` (string, required): 1-255 characters
- `link` (string, required): Valid URL
- `uploadedBy` (string, optional): Max 255 characters

**Example Request**:
```bash
curl -X POST \
  -H "X-API-Key: your-api-key" \
  -H "X-CSRF-Token: csrf-token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Annual Report 2024",
    "link": "https://example.com/report.pdf",
    "uploadedBy": "admin"
  }' \
  "http://localhost:3000/api/documents/admin/createDocument"
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Annual Report 2024",
    "link": "https://example.com/report.pdf",
    "uploadedBy": "admin",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses**:
- `400`: Validation error

---

### Update Document

Update an existing document.

**Endpoint**: `PUT /api/documents/admin/updateDocument/:id`

**Path Parameters**:
- `id` (string, required): Document UUID

**Headers**:
- `X-API-Key`: Your API key
- `X-CSRF-Token`: CSRF token
- `Content-Type`: application/json

**Request Body** (all fields optional):
```json
{
  "title": "Updated Title",
  "link": "https://example.com/updated.pdf"
}
```

**Example Request**:
```bash
curl -X PUT \
  -H "X-API-Key: your-api-key" \
  -H "X-CSRF-Token: csrf-token" \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title"}' \
  "http://localhost:3000/api/documents/admin/updateDocument/uuid"
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Updated Title",
    ...
  }
}
```

**Error Responses**:
- `400`: Validation error
- `404`: Document not found

---

### Delete Document

Delete a document.

**Endpoint**: `DELETE /api/documents/admin/deleteDocument/:id`

**Path Parameters**:
- `id` (string, required): Document UUID

**Headers**:
- `X-API-Key`: Your API key
- `X-CSRF-Token`: CSRF token

**Example Request**:
```bash
curl -X DELETE \
  -H "X-API-Key: your-api-key" \
  -H "X-CSRF-Token: csrf-token" \
  "http://localhost:3000/api/documents/admin/deleteDocument/uuid"
```

**Example Response**:
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

**Error Responses**:
- `404`: Document not found

---

### Bulk Create Documents

Create multiple documents via JSON array.

**Endpoint**: `POST /api/documents/admin/bulk`

**Headers**:
- `X-API-Key`: Your API key
- `X-CSRF-Token`: CSRF token
- `Content-Type`: application/json

**Request Body**:
```json
[
  {
    "title": "Document 1",
    "link": "https://example.com/doc1.pdf",
    "uploadedBy": "admin"
  },
  {
    "title": "Document 2",
    "link": "https://example.com/doc2.pdf",
    "uploadedBy": "admin"
  }
]
```

**Limits**:
- Maximum 1000 documents per request

**Example Request**:
```bash
curl -X POST \
  -H "X-API-Key: your-api-key" \
  -H "X-CSRF-Token: csrf-token" \
  -H "Content-Type: application/json" \
  -d @documents.json \
  "http://localhost:3000/api/documents/admin/bulk"
```

**Example Response**:
```json
{
  "success": true,
  "message": "Bulk create completed. 100 documents created.",
  "created": 100,
  "errors": [],
  "hasErrors": false
}
```

**Rate Limit**: 10 requests per minute per IP

---

### Delete All Documents

Delete all documents (use with caution).

**Endpoint**: `DELETE /api/documents/admin/deleteAllDocuments`

**Headers**:
- `X-API-Key`: Your API key
- `X-CSRF-Token`: CSRF token

**Example Request**:
```bash
curl -X DELETE \
  -H "X-API-Key: your-api-key" \
  -H "X-CSRF-Token: csrf-token" \
  "http://localhost:3000/api/documents/admin/deleteAllDocuments"
```

**Example Response**:
```json
{
  "success": true,
  "message": "Deleted 100 documents successfully",
  "count": 100
}
```

**Rate Limit**: 5 requests per minute per IP

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "link",
      "message": "Invalid URL format"
    }
  ]
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

### 404 Not Found
```json
{
  "success": false,
  "message": "Document not found"
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "message": "Too many requests, please try again later",
  "retryAfter": 60
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

